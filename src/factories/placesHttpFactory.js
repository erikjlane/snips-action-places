const { default: wretch } = require('wretch')
const { dedupe } = require('wretch-middlewares')
const configFactory = require('./configFactory')
const {
    LANGUAGE_MAPPINGS,
    SEARCH_RADIUS
} = require('../constants')

const BASE_URL = 'https://maps.googleapis.com/maps/api/place'

let placesHttp = wretch(BASE_URL)
    .middlewares([
        dedupe()
    ])

module.exports = {
    init(httpOptions = {}) {
        const config = configFactory.get()

        wretch().polyfills({
            fetch: httpOptions.mock || require('node-fetch')
        })
        placesHttp = placesHttp.query({
            key: config.apiKey
        })
    },

    findPlace: async (keyword) => {
        const config = configFactory.get()
        const query = {
            inputtype: 'textquery',
            input: keyword,
            locationbias: `circle:${ SEARCH_RADIUS }@${ config.currentCoordinates }`,
            language: LANGUAGE_MAPPINGS[config.locale]
        }

        const request = placesHttp.url('/findplacefromtext/json').query(query)
        console.log(request)

        const results = await request
            .get()
            .json()
            .catch(error => {
                // Network error
                if (error.name === 'TypeError')
                    throw new Error('APIRequest')
                // Other error
                throw new Error('APIResponse')
            })

        return results
    },

    nearbySearch: async ({ keyword, rankby='prominence', opennow=false, radius=SEARCH_RADIUS } = {}) => {
        const config = configFactory.get()
        let query = {
            location: config.currentCoordinates,
            keyword,
            rankby,
            opennow,
            language: LANGUAGE_MAPPINGS[config.locale]
        }

        if (rankby !== 'distance') {
            query = {
                ...query,
                radius
            }
        }

        const request = placesHttp.url('/nearbysearch/json').query(query)
        console.log(request)

        const results = await request
            .get()
            .json()
            .catch(error => {
                // Network error
                if (error.name === 'TypeError')
                    throw new Error('APIRequest')
                // Other error
                throw new Error('APIResponse')
            })

        return results
    },

    getDetails: async (placeId) => {
        const config = configFactory.get()
        const query = {
            placeid: placeId,
            region: config.currentRegion,
            language: LANGUAGE_MAPPINGS[config.locale]
        }

        const results = await placesHttp
            .url('/details/json')
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

        return results
    }
}