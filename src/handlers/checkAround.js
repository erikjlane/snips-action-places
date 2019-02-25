const { i18nFactory, httpFactory, configFactory } = require('../factories')
const { logger, slot, message, translation, places } = require('../utils')
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

    logger.info('CheckAround')

    checkCurrentCoordinates()

    const {
        locationTypes,
        locationNames
    } = await commonHandler(msg, knownSlots)

    // Get search_variable specific slot
    let searchVariables

    if (!('search_variables' in knownSlots)) {
        const searchVariablesSlot = message.getSlotsByName(msg, 'search_variable', {
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (searchVariablesSlot) {
            searchVariables = searchVariablesSlot.map(x => x.value.value)
        }
    } else {
        searchVariables = knownSlots.search_variables
    }

    logger.info('\tsearch_variables: ', searchVariables)

    // If both slots location_type and location_name are missing
    if (slot.missing(locationTypes) && slot.missing(locationNames)) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        flow.notRecognized((msg, flow) => {
            knownSlots.depth = knownSlots.depth - 1
            return require('./index').checkAround(msg, flow, knownSlots)
        })
        
        flow.continue('snips-assistant:CheckAround', (msg, flow) => {
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

            return require('./index').checkAround(msg, flow, slotsToBeSent)
        })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })
        
        return i18n('places.dialog.noLocation')
    } else {
        // Top rated is the stronger choice
        let rankby
        if (searchVariables.includes('nearby')) {
            rankby = 'distance'
        }
        if (searchVariables.includes('popular')) {
            rankby = 'prominence'
        }
        if (searchVariables.includes('top rated')) {
            rankby = 'prominence'
        }

        let opennow = false
        if (searchVariables.includes('open')) {
            opennow = true
        }

        const queryParameters = {
            keyword: places.beautifyLocationName(locationTypes, locationNames),
            rankby,
            opennow
        }

        // Get the data from Places API
        let placesData = await httpFactory.nearbySearch(queryParameters)
        logger.debug(placesData)

        // Keep the top-rated places only
        if (searchVariables.includes('top rated')) {
            placesData = places.topRatedFilter(placesData)
        } 

        let speech = ''
        try {
            speech = translation.nearbySearchToSpeech(locationTypes, searchVariables, placesData)
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }

        flow.end()
        logger.info(speech)
        return speech
    }
}