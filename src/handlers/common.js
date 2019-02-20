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

    let businessType, businessName, streetAddress

    // Slot business_type
    if (!('business_type' in knownSlots)) {
        const businessTypeSlot = message.getSlotsByName(msg, 'business_type', {
            onlyMostConfident: true
        })

        if (businessTypeSlot) {
            if (businessTypeSlot.confidence >= SLOT_CONFIDENCE_THRESHOLD) {
                businessType = businessTypeSlot.value.value
            }
        }
    } else {
        businessType = knownSlots.business_type
    }

    // Slot business_name
    if (!('business_name' in knownSlots)) {
        const businessNameSlot = message.getSlotsByName(msg, 'business_name', {
            onlyMostConfident: true
        })

        if (businessNameSlot) {
            if (businessNameSlot.confidence >= SLOT_CONFIDENCE_THRESHOLD) {
                businessName = businessNameSlot.value.value
            }
        }
    } else {
        businessName = knownSlots.business_name
    }

    // Slot street_address
    if (!('street_address' in knownSlots)) {
        const streetAddressSlot = message.getSlotsByName(msg, 'street_address', { 
            onlyMostConfident: true,
        })

        if (streetAddressSlot) {
            if (streetAddressSlot.confidence >= SLOT_CONFIDENCE_THRESHOLD) {
                streetAddress = streetAddressSlot.value.value
            }
        }
    } else {
        streetAddress = knownSlots.street_address
    }

    logger.info('\tbusiness_type: ', businessType)
    logger.info('\tbusiness_name: ', businessName)
    logger.info('\tstreet_address: ', streetAddress)

    return { businessType, businessName, streetAddress }
}