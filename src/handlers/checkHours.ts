import { logger, message, Handler } from 'snips-toolkit'
import { slot, translation, tts } from '../utils'
import commonHandler, { KnownSlots } from './common'
import { SLOT_CONFIDENCE_THRESHOLD } from '../constants'
import { Enums } from 'hermes-javascript/types'
import { buildQueryParameters, checkCurrentCoordinates } from './utils'
import { extractOpeningHours } from '../utils'
import { nearbySearch, getDetails } from '../api'

export const checkHoursHandler: Handler = async function(msg, flow, hermes, knownSlots: KnownSlots = { depth: 2 }) {
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
            if (dateTimeSlot.value.kind === Enums.slotType.instantTime) {
                dateTime = new Date(dateTimeSlot.value.value)
            }
            // Or is it a TimeInterval object?
            else if (dateTimeSlot.value.kind === Enums.slotType.timeInterval) {
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

        logger.debug(placeDetailsData)
        
        const locationName = placeDetailsData.result.name
        const address = placeDetailsData.result.vicinity
        const openingHours = extractOpeningHours(dateTime, placeDetailsData)
        
        const speech = translation.checkHoursToSpeech(locationName, address, dateTime, openingHours)
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
