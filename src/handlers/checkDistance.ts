import { logger, Handler, config } from 'snips-toolkit'
import { translation, slot, tts } from '../utils'
import commonHandler, { KnownSlots } from './common'
import { buildQueryParameters, checkCurrentCoordinates } from './utils'
import { nearbySearch, getDetails, calculateRoute } from '../api'

export const checkDistanceHandler: Handler = async function(msg, flow, hermes, knownSlots: KnownSlots = { depth: 2 }) {
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
    const parameters = buildQueryParameters(locationTypes, locationNames, searchVariables)
    const placesData = await nearbySearch(parameters.keyword, parameters.rankby, parameters.opennow)

    // Other endpoint
    /*
    const placesData = await findPlace(
        places.beautifyLocationName(locationTypes, locationNames)
    )
    */

    try {
        // Other endpoint
        /*
        const placeId = placesData.candidates[0].place_id
        */

        const placeId = placesData.results[0].place_id
        const placeDetailsData = await getDetails(placeId)
        const directionsData = await calculateRoute(config.get().currentCoordinates, placeId)

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
