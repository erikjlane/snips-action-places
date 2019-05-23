import { beautifyLocationName } from '../utils'
import { config } from 'snips-toolkit'
import { SEARCH_VARIABLES } from '../constants'

export function checkCurrentCoordinates() {
    if (!config.get().currentCoordinates) {
        throw new Error('noCurrentCoordinates')
    }
}

export function containsFlag(flag, searchVariables) {
    const lang = SEARCH_VARIABLES[config.get().locale]
    return lang && lang[flag] && searchVariables.includes(lang[flag])
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
    if (containsFlag('top rated', searchVariables)) {
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
