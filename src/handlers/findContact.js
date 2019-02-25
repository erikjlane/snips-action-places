const { i18nFactory, httpFactory, configFactory } = require('../factories')
const { logger, translation, slot, places, message } = require('../utils')
const commonHandler = require('./common')
const {
    SLOT_CONFIDENCE_THRESHOLD,
    INTENT_FILTER_PROBABILITY_THRESHOLD
} = require('../constants')

function checkCurrentCoordinates() {
    const config = configFactory.get()

    if (!config.currentCoordinates) {
        throw new Error('noCurrentCoordinates')
    }
}

module.exports = async function (msg, flow, knownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

    logger.info('FindContact')

    checkCurrentCoordinates()

    const {
        locationTypes,
        locationNames
    } = await commonHandler(msg, knownSlots)
    
    // Get contact_form specific slot
    let contactForm

    if (!('contact_form' in knownSlots)) {
        const contactFormSlot = message.getSlotsByName(msg, 'contact_form', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (contactFormSlot) {
            contactForm = contactFormSlot.value.value
        } else {
            contactForm = 'address'
        }
    } else {
        contactForm = knownSlots.contact_form
    }

    logger.info('\tcontact_form: ', contactForm)

    // If the slots location_type and location_name are missing
    if (slot.missing(locationTypes) && slot.missing(locationNames)) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        flow.notRecognized((msg, flow) => {
            knownSlots.depth = knownSlots.depth - 1
            return require('./index').findContact(msg, flow, knownSlots)
        })
        
        flow.continue('snips-assistant:FindContact', (msg, flow) => {
            if (msg.intent.probability < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                throw new Error('intentNotRecognized')
            }
            
            const slotsToBeSent = {
                depth: knownSlots.depth - 1
            }

            // Adding the known slots, if more
            if (!slot.missing(locationTypes)) {
                slotsToBeSent.location_types = locationTypes
            }
            if (!slot.missing(locationNames)) {
                slotsToBeSent.location_names = locationNames
            }

            return require('./index').findContact(msg, flow, slotsToBeSent)
        })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })
        
        return i18n('places.dialog.noLocation')
    } else {
        logger.info(places.beautifyLocationName(locationTypes, locationNames))
        // Get the data from Places API
        const placeData = await httpFactory.findPlace(
            places.beautifyLocationName(locationTypes, locationNames)
        )
        logger.debug(placeData)

        let speech = ''
        try {
            const placeId = placeData.candidates[0].place_id
            const placeDetailsData = await httpFactory.getDetails(placeId)

            logger.debug(placeDetailsData)

            const locationName = placeDetailsData.result.name

            const phoneNumber = placeDetailsData.result.formatted_phone_number
            const address = placeDetailsData.result.formatted_address
            speech = translation.findContactToSpeech(locationName, contactForm, phoneNumber, address)
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }

        flow.end()
        logger.info(speech)
        return speech
    }
}