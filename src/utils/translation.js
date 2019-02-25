const i18nFactory = require('../factories/i18nFactory')
const beautify = require('./beautify')
const time = require('./time')

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

    nearbySearchToSpeech (locationTypes, searchVariables, placesData) {
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

    checkHoursToSpeech (locationName, address, dateTime, openingHours) {
        const i18n = i18nFactory.get()

        if (openingHours.openDate && openingHours.closeDate) {
            if (time.isToday(dateTime)) {
                return i18n('places.checkHours.openingHours.openRangeToday', {
                    location: locationName,
                    address: beautify.address(address),
                    open_date: beautify.time(openingHours.openDate),
                    close_date: beautify.time(openingHours.closeDate)
                })
            } else if (!time.moreThanAWeek(dateTime)) {
                return i18n('places.checkHours.nearFutureOpeningHours.openRangeToday', {
                    location: locationName,
                    address: beautify.address(address),
                    open_date: beautify.time(openingHours.openDate),
                    close_date: beautify.time(openingHours.closeDate),
                    day_in_week: time.dayToText(dateTime.getDay())
                })
            } else {
                return i18n('places.checkHours.futureOpeningHours.openRangeToday', {
                    location: locationName,
                    address: beautify.address(address),
                    open_date: beautify.time(openingHours.openDate),
                    close_date: beautify.time(openingHours.closeDate),
                    day_in_week: `${ time.dayToText(dateTime.getDay()) }s`
                })
            }
        } else {
            return i18n('places.checkHours.noOpeningHours', {
                location: locationName,
                address: beautify.address(address)
            })
        }
    },

    findContactToSpeech (locationName, contactForm, phoneNumber, address) {
        const i18n = i18nFactory.get()

        if (contactForm === 'number') {
            if (phoneNumber) {
                return i18n('places.findContact.phoneNumber', {
                    location: locationName,
                    address: beautify.address(address),
                    phone_number: phoneNumber
                })
            } else {
                return i18n('places.findContact.noPhoneNumber', {
                    location: locationName,
                    address: beautify.address(address)
                })
            }
        } else {
            return i18n('places.findContact.address', {
                location: locationName,
                address: address
            })
        }
    },

    checkDistanceToSpeech (locationName, address, distance) {
        const i18n = i18nFactory.get()

        return i18n('places.checkDistance.distance', {
            location: locationName,
            address: beautify.address(address),
            distance: beautify.distance(distance)
        })
    }
}