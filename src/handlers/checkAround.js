const { i18nFactory, placesHttpFactory } = require('../factories')
const { logger, slot } = require('../utils')
const commonHandler = require('./common')
const {
    INTENT_FILTER_PROBABILITY_THRESHOLD
} = require('../constants')

module.exports = async function(msg, flow, knownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

    logger.info('CheckAround')

    const {
        businessType,
        businessName,
        streetAddress
    } = commonHandler(msg, knownSlots)

    logger.debug(businessType)

    // The business_type slot is missing
    if (slot.missing(businessType)) {
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
            
            let slotsToBeSent = {
                business_name: businessName,
                street_address: streetAddress,
                depth: knownSlots.depth - 1
            }

            // Adding the known slots, if more
            if (!slot.missing(businessType)) {
                slotsToBeSent.business_type = businessType
            }

            return require('./index').checkAround(msg, flow, slotsToBeSent)
        })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })
        
        return `slot business_type is missing ${ businessType }`
    } else {
        // Get the data from Places API
        const placesData = await placesHttpFactory.searchNearby({
            location: config.currentCoords,
            name: businessType
        })
        logger.debug(placesData)

        let speech = ''
        try {
            speech = 'test'
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }

        flow.end()
        logger.info(speech)
        return speech
    }
}