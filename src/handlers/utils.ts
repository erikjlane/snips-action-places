import { beautifyLocationName } from '../utils'
import { config } from 'snips-toolkit'
import { SEARCH_VARIABLES } from '../constants'

export function checkCurrentCoordinates() {
    if (!config.get().currentCoordinates) {
        throw new Error('noCurrentCoordinates')
    }
}

export function containsFlag(flag, searchVariables) {
    const flags = SEARCH_VARIABLES[config.get().locale]
    return flags && flags[flag] && searchVariables.includes(flags[flag])
}

export function buildQueryParameters(locationTypes, locationNames, searchVariables) {
    // Top rated is the stronger choice
    let rankby
    if (containsFlag('popular', searchVariables)) {
        rankby = 'prominence'
    }
    if (containsFlag('nearby', searchVariables)) {
        rankby = 'distance'
    }
    if (containsFlag('top_rated', searchVariables)) {
        rankby = 'prominence'
    }

    let opennow = false
    if (containsFlag('open', searchVariables)) {
        opennow = true
    }

    return {
        keyword: beautifyLocationName(locationTypes, locationNames),
        rankby,
        opennow
    }
}
