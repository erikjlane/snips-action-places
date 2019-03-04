const { i18nFactory, httpFactory, configFactory } = require('../factories')
const { logger, slot, message, places, translation, tts } = require('../utils')
const commonHandler = require('./common')
const {
    SLOT_CONFIDENCE_THRESHOLD,
    INTENT_FILTER_PROBABILITY_THRESHOLD
} = require('../constants')
const { Dialog } = require('hermes-javascript')
const { buildQueryParameters } = require('./utils')

function checkCurrentCoordinates() {
    const config = configFactory.get()

    if (!config.currentCoordinates) {
        throw new Error('noCurrentCoordinates')
    }
}

module.exports = async function(msg, flow, knownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

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
            if (dateTimeSlot.value.kind === Dialog.enums.slotType.instantTime) {
                dateTime = new Date(dateTimeSlot.value.value)
            }
            // Or is it a TimeInterval object?
            else if (dateTimeSlot.value.kind === Dialog.enums.slotType.timeInterval) {
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

    // If the slots location_type and location_name are missing
    if ((slot.missing(locationTypes) && slot.missing(locationNames))) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            msg.slots = []
            return require('./index').checkHours(msg, flow, knownSlots)
        })
        
        flow.continue('snips-assistant:CheckHours', (msg, flow) => {
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
            if (!slot.missing(searchVariables)) {
                slotsToBeSent.search_variables = searchVariables
            }
            if (!slot.missing(dateTime)) {
                slotsToBeSent.date_time = dateTime
            }

            return require('./index').checkHours(msg, flow, slotsToBeSent)
        })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })

        if (slot.missing(locationTypes) && slot.missing(locationNames)) {
            return i18n('places.dialog.noLocation')
        } else {
            return i18n('places.dialog.noHourToCheck')
        }
    } else {
        flow.end()

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
            // Other endpoint
            /*
            const placeId = placesData.candidates[0].place_id
            */

            const placeId = placesData.results[0].place_id
            const placeDetailsData = await httpFactory.getDetails(placeId)

            logger.debug(placeDetailsData)
            
            const locationName = placeDetailsData.result.name
            const address = placeDetailsData.result.vicinity
            const openingHours = places.extractOpeningHours(dateTime, placeDetailsData)
            
            tts.say(translation.checkHoursToSpeech(locationName, address, dateTime, openingHours))
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }

        return ''
    }
}