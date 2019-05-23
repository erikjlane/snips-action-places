import { message, logger } from 'snips-toolkit'
import { NluSlot, slotType } from 'hermes-javascript/types'
import { SLOT_CONFIDENCE_THRESHOLD } from '../constants'

export type KnownSlots = {
    depth: number,
    location_types?: string[],
    location_names?: string[],
    search_variables?: string[],
    date_time?: Date,
    contact_form?: string
}

export default async function (msg, knownSlots: KnownSlots) {
    let locationTypes, locationNames, searchVariables

    // Slot location_type
    if (!('location_types' in knownSlots)) {
        const locationTypesSlot: NluSlot<slotType.custom>[] | null = message.getSlotsByName(msg, 'location_type', {
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (locationTypesSlot) {
            // Keeping only first item for now
            locationTypes = locationTypesSlot.slice(0, 1).map(x => x.value.value)
        }
    } else {
        locationTypes = knownSlots.location_types
    }    

    // Slot location_name
    if (!('location_names' in knownSlots)) {
        const locationNamesSlot: NluSlot<slotType.custom>[] | null = message.getSlotsByName(msg, 'location_name', {
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (locationNamesSlot) {
            // Keeping only 2 first items for now
            locationNames = locationNamesSlot.slice(0, 2).map(x => x.value.value)
        }
    } else {
        locationNames = knownSlots.location_names
    }

    // Slot search_variable
    if (!('search_variables' in knownSlots)) {
        const searchVariablesSlot: NluSlot<slotType.custom>[] | null = message.getSlotsByName(msg, 'search_variable', {
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