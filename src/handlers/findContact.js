const { httpFactory, configFactory } = require('../factories')
const { logger, slot, message, translation, tts } = require('../utils')
const commonHandler = require('./common')
const {
    SLOT_CONFIDENCE_THRESHOLD
} = require('../constants')
const { buildQueryParameters } = require('./utils')

function checkCurrentCoordinates() {
    const config = configFactory.get()

    if (!config.currentCoordinates) {
        throw new Error('noCurrentCoordinates')
    }
}

module.exports = async function (msg, flow, hermes, knownSlots = { depth: 2 }) {
    logger.info('FindContact')

    checkCurrentCoordinates()

    const {
        locationTypes,
        locationNames,
        searchVariables
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
        }
    } else {
        contactForm = knownSlots.contact_form
    }

    logger.info('\tcontact_form: ', contactForm)

    // If the slots location_type and location_name are missing
    if (slot.missing(locationTypes) && slot.missing(locationNames)) {
        throw new Error('intentNotRecognized')
    }

    if (slot.missing(contactForm)) {
        contactForm = 'number'
    }

    const now = Date.now()

    // Get the data from Places API
    let placesData = await httpFactory.nearbySearch(
        buildQueryParameters(locationTypes, locationNames, searchVariables)
    )

    // Other endpoint
    /*
    const placesData = await httpFactory.findPlace(
        places.beautifyLocationName(locationTypes, locationNames)
    )
    */

    try {
        // Other endpoint
        /*
        const placeId = placesData.candidates[0].place_id
        */

        const placeId = placesData.results[0].place_id
        const placeDetailsData = await httpFactory.getDetails(placeId)

        logger.debug(placeDetailsData)

        const locationName = placeDetailsData.result.name
        const phoneNumber = placeDetailsData.result.formatted_phone_number
        const address = placeDetailsData.result.formatted_address
        
        const speech = translation.findContactToSpeech(locationName, contactForm, phoneNumber, address)
        logger.info(speech)

        flow.end()
        if (Date.now() - now < 4000) {
            return speech
        } else {
            tts.say(hermes, speech)
        }
    } catch (error) {
        logger.error(error)
        throw new Error('APIResponse')
    }
}
