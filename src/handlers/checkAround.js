const { httpFactory, configFactory } = require('../factories')
const { logger, translation, slot, places, tts } = require('../utils')
const commonHandler = require('./common')
const { buildQueryParameters } = require('./utils')

function checkCurrentCoordinates() {
    const config = configFactory.get()

    if (!config.currentCoordinates) {
        throw new Error('noCurrentCoordinates')
    }
}

module.exports = async function(msg, flow, knownSlots = { depth: 2 }) {
    logger.info('CheckAround')

    checkCurrentCoordinates()

    const {
        locationTypes,
        locationNames,
        searchVariables
    } = await commonHandler(msg, knownSlots)

    // If both slots location_type and location_name are missing
    if (slot.missing(locationTypes) && slot.missing(locationNames)) {
        throw new Error('intentNotRecognized')
    }

    const now = Date.now()

    // Get the data from Places API
    let placesData = await httpFactory.nearbySearch(
        buildQueryParameters(locationTypes, locationNames, searchVariables)
    )

    try {
        // Keep the top-rated places only
        if (searchVariables.includes('top rated')) {
            placesData.results = places.topRatedFilter(placesData)
        }
        logger.debug(placesData)
        
        const speech = translation.nearbySearchToSpeech(locationTypes, searchVariables, placesData)
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
