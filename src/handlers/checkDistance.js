const { httpFactory, configFactory } = require('../factories')
const { logger, translation, slot, tts } = require('../utils')
const commonHandler = require('./common')
const { buildQueryParameters } = require('./utils')

function checkCurrentCoordinates() {
    const config = configFactory.get()

    if (!config.currentCoordinates) {
        throw new Error('noCurrentCoordinates')
    }
}

module.exports = async function(msg, flow, hermes, knownSlots = { depth: 2 }) {
    logger.info('CheckDistance')

    checkCurrentCoordinates()

    const {
        locationTypes,
        locationNames,
        searchVariables
    } = await commonHandler(msg, knownSlots)

    // If the slots location_type and location_name are missing
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
        const config = configFactory.get()

        // Other endpoint
        /*
        const placeId = placesData.candidates[0].place_id
        */
        
        const placeId = placesData.results[0].place_id
        const placeDetailsData = await httpFactory.getDetails(placeId)
        const directionsData = await httpFactory.calculateRoute(config.currentCoordinates, placeId)

        const locationName = placeDetailsData.result.name
        const address = placeDetailsData.result.vicinity
        const distance = directionsData.routes[0].legs[0].distance.value
        
        const speech = translation.checkDistanceToSpeech(locationName, address, distance)
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
