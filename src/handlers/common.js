const { message, logger } = require('../utils')
const {
    INTENT_PROBABILITY_THRESHOLD,
    SLOT_CONFIDENCE_THRESHOLD,
    ASR_UTTERANCE_CONFIDENCE_THRESHOLD
} = require('../constants')

module.exports = async function (msg, knownSlots = {}) {
    if (msg.intent) {
        if (msg.intent.confidenceScore < INTENT_PROBABILITY_THRESHOLD) {
            throw new Error('intentNotRecognized')
        }
        if (message.getAsrConfidence(msg) < ASR_UTTERANCE_CONFIDENCE_THRESHOLD) {
            throw new Error('intentNotRecognized')
        }
    }

    let locationTypes, locationNames, searchVariables

    // Slot location_type
    if (!('location_types' in knownSlots)) {
        const locationTypesSlot = message.getSlotsByName(msg, 'location_type', {
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (locationTypesSlot) {
            locationTypes = locationTypesSlot.map(x => x.value.value)
        }
    } else {
        locationTypes = knownSlots.location_types
    }

    // Slot location_name
    if (!('location_names' in knownSlots)) {
        const locationNamesSlot = message.getSlotsByName(msg, 'location_name', {
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (locationNamesSlot) {
            locationNames = locationNamesSlot.map(x => x.value.value)
        }
    } else {
        locationNames = knownSlots.location_names
    }

    // Slot search_variable
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

    logger.info('\tlocation_types: ', locationTypes)
    logger.info('\tlocation_names: ', locationNames)
    logger.info('\tsearch_variables: ', searchVariables)

    return { locationTypes, locationNames, searchVariables }
}