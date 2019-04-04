const { httpFactory, configFactory } = require('../factories')
const { logger, slot, message, places, translation, tts } = require('../utils')
const commonHandler = require('./common')
const {
    SLOT_CONFIDENCE_THRESHOLD
} = require('../constants')
const { Dialog } = require('hermes-javascript')
const { buildQueryParameters } = require('./utils')

function checkCurrentCoordinates() {
    const config = configFactory.get()

    if (!config.currentCoordinates) {
        throw new Error('noCurrentCoordinates')
    }
}

module.exports = async function(msg, flow, knownSlots = { depth: 2 }) {
    logger.info('CheckHours')

    checkCurrentCoordinates()

    const {
        locationTypes,
        locationNames,
        searchVariables
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
            if (dateTimeSlot.value.kind === Dialog.enums.slotType.instantTime) {
                dateTime = new Date(dateTimeSlot.value.value)
            }
            // Or is it a TimeInterval object?
            else if (dateTimeSlot.value.kind === Dialog.enums.slotType.timeInterval) {
                const from = dateTimeSlot.value.from
                if (from) {
                    dateTime = new Date(from)
                } else {
                    const to = dateTimeSlot.value.to
                    if (to) {
                        dateTime = new Date(to)
                    }
                }
            }
        } else {
            dateTime = new Date()
        }
    } else {
        dateTime = knownSlots.date_time
    }

    logger.info('\tdate_time: ', dateTime)

    if (slot.missing(locationTypes) && slot.missing(locationNames)) {
        throw new Error('intentNotRecognized')
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
        const address = placeDetailsData.result.vicinity
        const openingHours = places.extractOpeningHours(dateTime, placeDetailsData)
        
        const speech = translation.checkHoursToSpeech(locationName, address, dateTime, openingHours)
        logger.info(speech)

        flow.end()
        if (Date.now() - now < 4000) {
            return speech
        } else {
            tts.say(speech)
        }
    } catch (error) {
        logger.error(error)
        throw new Error('APIResponse')
    }
}
