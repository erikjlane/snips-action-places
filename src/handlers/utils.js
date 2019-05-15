const { places } = require('../utils')
const { configFactory } = require('../factories')
const {
    LANGUAGE_MAPPINGS,
    SEARCH_VARIABLES
} = require ('../constants')

module.exports = {
    containsFlag: (flag, searchVariables) => {
        const config = configFactory.get()
        const key = LANGUAGE_MAPPINGS[config.locale]
        const lang = SEARCH_VARIABLES[key]

        return lang && lang[flag] && searchVariables.includes(lang[flag])
    },

    buildQueryParameters: (locationTypes, locationNames, searchVariables) => {
        const { containsFlag } = module.exports

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
            keyword: places.beautifyLocationName(locationTypes, locationNames),
            rankby,
            opennow
        }
    }
}
