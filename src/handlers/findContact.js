const { i18nFactory, placesHttpFactory, configFactory } = require('../factories')
const { logger, slot, message, places } = require('../utils')
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

    logger.info('FindContact')

    checkCurrentCoordinates()

    const {
        locationType,
        locationName
    } = await commonHandler(msg, knownSlots)

    // Get date_time specific slot
    let dateTime

    if (!('date_time' in knownSlots)) {
        const dateTimeSlot = message.getSlotsByName(msg, 'date_time', {
            onlyMostConfident: true
        })

        if (dateTimeSlot) {
            if (dateTimeSlot.confidence >= SLOT_CONFIDENCE_THRESHOLD) {
                searchVariables = dateTimeSlot.value.value
            }
        }
    } else {
        dateTime = knownSlots.date_time
    }

    logger.info('\tdate_time: ', dateTime)

    // If the slots location_type and location_name are missing
    if (slot.missing(locationType) && slot.missing(locationName)) {
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
            if (!slot.missing(locationType)) {
                slotsToBeSent.location_type = locationType
            }
            if (!slot.missing(locationName)) {
                slotsToBeSent.location_name = locationName
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
        // Get the data from Places API
        const placeData = await placesHttpFactory.findPlace({
            keyword: places.beautifyLocationName(locationType, locationName)
        })
        logger.debug(placeData)

        let speech = ''
        try {
            const placeId = placeData.candidates[0].place_id
            const placeDetailsData = await placesHttpFactory.getDetails(placeId)

            logger.debug(placeDetailsData)

            speech = placeDetailsData.result.formatted_phone_number
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }

        flow.end()
        logger.info(speech)
        return speech
    }
}