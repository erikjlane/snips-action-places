const { places } = require('../utils')

module.exports = {
    buildQueryParameters: (locationTypes, locationNames, searchVariables) => {
        // Top rated is the stronger choice
        let rankby
        if (searchVariables.includes('popular')) {
            rankby = 'prominence'
        }
        if (searchVariables.includes('nearby')) {
            rankby = 'distance'
        }
        if (searchVariables.includes('top rated')) {
            rankby = 'prominence'
        }

        let opennow = false
        if (searchVariables.includes('open')) {
            opennow = true
        }

        return {
            keyword: places.beautifyLocationName(locationTypes, locationNames),
            rankby,
            opennow
        }
    }
}