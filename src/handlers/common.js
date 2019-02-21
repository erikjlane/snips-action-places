const { message, logger, math } = require('../utils')
const {
    INTENT_PROBABILITY_THRESHOLD,
    SLOT_CONFIDENCE_THRESHOLD,
    ASR_UTTERANCE_CONFIDENCE_THRESHOLD
} = require('../constants')

module.exports = async function (msg, knownSlots = {}) {
    if (msg.intent.probability < INTENT_PROBABILITY_THRESHOLD) {
        throw new Error('intentNotRecognized')
    }
    if (math.geometricMean(msg.asr_tokens.map(token => token.confidence)) < ASR_UTTERANCE_CONFIDENCE_THRESHOLD) {
        throw new Error('intentNotRecognized')
    }

    let locationType, locationName, streetAddress

    // Slot location_type
    if (!('location_type' in knownSlots)) {
        const locationTypeSlot = message.getSlotsByName(msg, 'location_type', {
            onlyMostConfident: true
        })

        if (locationTypeSlot) {
            if (locationTypeSlot.confidence >= SLOT_CONFIDENCE_THRESHOLD) {
                locationType = locationTypeSlot.value.value
            }
        }
    } else {
        locationType = knownSlots.location_type
    }

    // Slot location_name
    if (!('location_name' in knownSlots)) {
        const locationNameSlot = message.getSlotsByName(msg, 'location_name', {
            onlyMostConfident: true
        })

        if (locationNameSlot) {
            if (locationNameSlot.confidence >= SLOT_CONFIDENCE_THRESHOLD) {
                locationName = locationNameSlot.value.value
            }
        }
    } else {
        locationName = knownSlots.location_name
    }

    logger.info('\tlocation_type: ', locationType)
    logger.info('\tlocation_name: ', locationName)

    return { locationType, locationName, streetAddress }
}