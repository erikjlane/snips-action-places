const { i18nFactory, placesHttpFactory, configFactory } = require('../factories')
const { logger, slot, message, translation } = require('../utils')
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
        locationType,
        locationName
    } = await commonHandler(msg, knownSlots)

    // Get search_variable specific slot
    let searchVariable

    if (!('search_variable' in knownSlots)) {
        const searchVariableSlot = message.getSlotsByName(msg, 'search_variable', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (searchVariableSlot) {
            searchVariable = searchVariableSlot.value.value
        }
    } else {
        searchVariable = knownSlots.search_variable
    }

    logger.info('\tsearch_variable: ', searchVariable)

    // If both slots location_type and location_name are missing
    if (slot.missing(locationType) && slot.missing(locationName)) {
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
            if (!slot.missing(locationType)) {
                slotsToBeSent.location_type = locationType
            }
            if (!slot.missing(locationName)) {
                slotsToBeSent.location_name = locationName
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
        const config = configFactory.get()

        // Get the data from Places API
        const placesData = await placesHttpFactory.nearbySearch({
            location: config.currentCoordinates,
            name: `${ locationType } ${ locationName }`
        })
        logger.debug(placesData)

        let speech = ''
        try {
            speech = translation.nearbySearchToSpeech(locationType, locationName, searchVariable, placesData)
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }

        flow.end()
        logger.info(speech)
        return speech
    }
}