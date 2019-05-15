const { default: wretch } = require('wretch')
const { dedupe } = require('wretch-middlewares')
const configFactory = require('./configFactory')
const {
    LANGUAGE_MAPPINGS,
    SEARCH_RADIUS
} = require('../constants')

const BASE_URL = 'https://maps.googleapis.com/maps/api'

let http = wretch(BASE_URL)
    .middlewares([
        dedupe()
    ])

module.exports = {
    init(httpOptions = {}) {
        const config = configFactory.get()

        wretch().polyfills({
            fetch: httpOptions.mock || require('node-fetch')
        })
        http = http.query({
            language: LANGUAGE_MAPPINGS[config.locale],
            key: config.apiKey
        })
    },

    findPlace: async (keyword) => {
        const config = configFactory.get()
        const query = {
            inputtype: 'textquery',
            input: keyword,
            locationbias: `circle:${ SEARCH_RADIUS }@${ config.currentCoordinates }`
        }

        const results = await http.url('/place/findplacefromtext/json')
            .query(query)
            .get()
            .json()
            .catch(error => {
                // Network error
                if (error.name === 'TypeError')
                    throw new Error('APIRequest')
                // Other error
                throw new Error('APIResponse')
            })

        if (results) {
            if (results.status === 'ZERO_RESULTS' || results.status === 'NOT FOUND') {
                throw new Error('place')
            }
        }

        return results
    },

    nearbySearch: async ({ keyword, rankby='prominence', opennow=false, radius=SEARCH_RADIUS } = {}) => {
        const config = configFactory.get()
        let query = {
            location: config.currentCoordinates,
            keyword,
            rankby,
            opennow
        }

        if (rankby !== 'distance') {
            query = {
                ...query,
                radius
            }
        }

        const results = await http.url('/place/nearbysearch/json')
            .query(query)
            .get()
            .json()
            .catch(error => {
                // Network error
                if (error.name === 'TypeError')
                    throw new Error('APIRequest')
                // Other error
                throw new Error('APIResponse')
            })

        if (results) {
            if (results.status === 'ZERO_RESULTS' || results.status === 'NOT FOUND') {
                throw new Error('place')
            }
        }

        return results
    },

    getDetails: async (placeId) => {
        const config = configFactory.get()
        const query = {
            placeid: placeId,
            region: config.currentRegion
        }

        const results = await http
            .url('/place/details/json')
            .query(query)
            .get()
            .json()
            .catch(error => {
                // Network error
                if (error.name === 'TypeError')
                    throw new Error('APIRequest')
                // Other error
                throw new Error('APIResponse')
            })

        if (results) {
            if (results.status === 'ZERO_RESULTS' || results.status === 'NOT FOUND') {
                throw new Error('place')
            }
        }

        return results
    },

    calculateRoute: async (origin, placeId) => {
        const query = {
            origin,
            destination: `place_id:${ placeId }`
        }

        const results = await http
            .url('/directions/json')
            .query(query)
            .get()
            .json()
            .catch(error => {
                // Network error
                if (error.name === 'TypeError')
                    throw new Error('APIRequest')
                // Other error
                throw new Error('APIResponse')
            })

        if (results) {
            if (results.status === 'ZERO_RESULTS' || results.status === 'NOT FOUND') {
                throw new Error('place')
            }
        }

        return results
    }
}
