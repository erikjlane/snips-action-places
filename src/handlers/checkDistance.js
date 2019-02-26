const { i18nFactory, httpFactory, configFactory } = require('../factories')
const { logger, translation, places, slot } = require('../utils')
const commonHandler = require('./common')
const {
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

    logger.info('CheckDistance')

    checkCurrentCoordinates()

    // Extracting slots
    const {
        locationTypes,
        locationNames
    } = await commonHandler(msg, knownSlots)

    // If the slots location_type and location_name are missing
    if (slot.missing(locationTypes) && slot.missing(locationNames)) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            msg.slots = []
            return require('./index').checkDistance(msg, flow, knownSlots)
        })

        flow.continue('snips-assistant:CheckDistance', (msg, flow) => {
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

            return require('./index').checkDistance(msg, flow, slotsToBeSent)
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
        const placeData = await httpFactory.findPlace(
            places.beautifyLocationName(locationTypes, locationNames)
        )
        logger.debug(placeData)

        let speech = ''
        try {
            const config = configFactory.get()
            
            const placeId = placeData.candidates[0].place_id
            const placeDetailsData = await httpFactory.getDetails(placeId)
            const directionsData = await httpFactory.calculateRoute(config.currentCoordinates, placeId)

            const locationName = placeDetailsData.result.name
            const address = placeDetailsData.result.vicinity
            const distance = directionsData.routes[0].legs[0].distance.value
            speech = translation.checkDistanceToSpeech(locationName, address, distance)
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }

        flow.end()
        logger.info(speech)
        return speech
    }
}