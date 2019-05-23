import { logger, Handler } from 'snips-toolkit'
import { translation, slot, tts } from '../utils'
import commonHandler, { KnownSlots } from './common'
import { buildQueryParameters, checkCurrentCoordinates, containsFlag } from './utils'
import { topRatedFilter } from '../utils'
import { nearbySearch } from '../api'

export const checkAroundHandler: Handler = async function(msg, flow, hermes, knownSlots: KnownSlots = { depth: 2 }) {
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
    const parameters = buildQueryParameters(locationTypes, locationNames, searchVariables)
    let placesData = await nearbySearch(parameters.keyword, parameters.rankby, parameters.opennow)

    try {
        // Keep the top-rated places only
        if (containsFlag('top_rated', searchVariables)) {
            placesData.results = topRatedFilter(placesData)
        }
        logger.debug(placesData)
        
        const speech = translation.nearbySearchToSpeech(locationTypes, searchVariables, placesData)
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
