const { i18nFactory, placesHttpFactory, configFactory } = require('../factories')
const { logger, slot, message, places, translation } = require('../utils')
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

module.exports = async function(msg, flow, knownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

    logger.info('CheckHours')

    checkCurrentCoordinates()

    const {
        locationTypes,
        locationNames
    } = await commonHandler(msg, knownSlots)

    // Get date_time specific slot
    let dateTime

    if (!('date_time' in knownSlots)) {
        const dateTimeSlot = message.getSlotsByName(msg, 'date_time', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (dateTimeSlot) {
            // Is it an InstantTime object?
            if (dateTimeSlot.value.value_type === 4) {
                dateTime = new Date(dateTimeSlot.value.value.value)
            }
            // Or is it a TimeInterval object?
            else if (dateTimeSlot.value.value_type === 5) {
                const to = dateTimeSlot.value.value.to
                if (to) {
                    dateTime = new Date(to)
                } else {
                    const from = dateTimeSlot.value.value.from
                    if (from) {
                        dateTime = new Date(from)
                    }
                }
            }
        }
    } else {
        dateTime = knownSlots.date_time
    }

    logger.info('\tdate_time: ', dateTime)

    // If the slots location_type and location_name are missing
    if (slot.missing(locationTypes) && slot.missing(locationNames)) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        flow.notRecognized((msg, flow) => {
            knownSlots.depth = knownSlots.depth - 1
            return require('./index').checkHours(msg, flow, knownSlots)
        })
        
        flow.continue('snips-assistant:CheckHours', (msg, flow) => {
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

            return require('./index').checkHours(msg, flow, slotsToBeSent)
        })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })
        
        return i18n('places.dialog.noLocation')
    } else {
        // Get the data from Places API
        const placeData = await placesHttpFactory.findPlace(
            places.beautifyLocationName(locationTypes, locationNames)
        )
        logger.debug(placeData)

        let speech = ''
        try {
            const placeId = placeData.candidates[0].place_id
            const placeDetailsData = await placesHttpFactory.getDetails(placeId)
            
            const openingHours = places.extractOpeningHours(dateTime, placeDetailsData)
            speech = translation.checkHoursToSpeech(locationTypes, locationNames, openingHours, placeDetailsData)
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }

        flow.end()
        logger.info(speech)
        return speech
    }
}