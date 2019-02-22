const i18nFactory = require('../factories/i18nFactory')
const { beautifyLocationName } = require('./places')
const beautify = require('./beautify')

module.exports = {
    // Outputs an error message based on the error object, or a default message if not found.
    errorMessage: async error => {
        let i18n = i18nFactory.get()

        if(!i18n) {
            await i18nFactory.init()
            i18n = i18nFactory.get()
        }

        if(i18n) {
            return i18n([`error.${error.message}`, 'error.unspecific'])
        } else {
            return 'Oops, something went wrong.'
        }
    },
    // Takes an array from the i18n and returns a random item.
    randomTranslation (key, opts) {
        const i18n = i18nFactory.get()
        const possibleValues = i18n(key, { returnObjects: true, ...opts })
        const randomIndex = Math.floor(Math.random() * possibleValues.length)
        return possibleValues[randomIndex]
    },

    nearbySearchToSpeech (locationTypes, locationNames, searchVariables, placesData) {
        const { randomTranslation } = module.exports

        const placesNumber = placesData.results.length
        let tts = '', searchVariable = 'distance'

        if (searchVariables.includes('top rated')) {
            searchVariable = 'prominence'
        }

        if (placesNumber === 0) {
            tts += randomTranslation(`places.checkAround.${ searchVariable }.noResults`, {
                location_type: locationTypes[0] || 'place like this'
            })
        } else if (placesNumber === 1) {
            tts += randomTranslation(`places.checkAround.${ searchVariable }.oneResult`, {
                location_type: locationTypes[0] || 'place like this',
                location_name_1: placesData.results[0].name,
                location_street_1: beautify.address(placesData.results[0].vicinity),
            })
        } else if (placesNumber === 2) {
            tts += randomTranslation(`places.checkAround.${ searchVariable }.twoResults`, {
                location_type: locationTypes[0] || 'places',
                location_name_1: placesData.results[0].name,
                location_street_1: beautify.address(placesData.results[0].vicinity),
                location_name_2: placesData.results[1].name,
                location_street_2: beautify.address(placesData.results[1].vicinity),
            })
        } else if (placesNumber > 2) {
            tts += randomTranslation(`places.checkAround.${ searchVariable }.multipleResults`, {
                location_type: locationTypes[0] || 'places',
                location_name_1: placesData.results[0].name,
                location_street_1: beautify.address(placesData.results[0].vicinity),
                location_name_2: placesData.results[1].name,
                location_street_2: beautify.address(placesData.results[1].vicinity),
                location_name_3: placesData.results[2].name,
                location_street_3: beautify.address(placesData.results[2].vicinity)
            })
        }

        return tts
    },

    checkHoursToSpeech (locationTypes, locationNames, dateTime, placeData) {
        const i18n = i18nFactory.get()

        let tts = ''

        if (placeData && placeData.opening_hours) {
            if (dateTime) {
                // Is dateTime in range opening_hours?
                tts += placeData.opening_hours.weekday_text[0]
            } else {
                if (placeData.opening_hours.open_now) {
                    tts += i18n('places.checkHours.openedNow', {
                        location: beautifyLocationName(locationTypes, locationNames)
                    })
                } else {
                    tts += i18n('places.checkHours.notOpenedNow', {
                        location: beautifyLocationName(locationTypes, locationNames)
                    })
                }
            }
        } else {
            tts += i18n('places.checkHours.noOpeningHours')
        }

        return tts
    }
}