import { i18n } from 'snips-toolkit'
import { beautify } from './beautify'
import { time } from './time'
import { containsFlag } from '../handlers/utils'

export const translation = {
    nearbySearchToSpeech (locationTypes, searchVariables, placesData) {
        const placesNumber = placesData.results.length
        let tts = '', searchVariable = 'prominence'

        if (containsFlag('popular', searchVariables)) {
            searchVariable = 'prominence'
        }
        if (containsFlag('nearby', searchVariables)) {
            searchVariable = 'distance'
        }
        if (containsFlag('top_rated', searchVariables)) {
            searchVariable = 'topRated'
        }

        type Parameters = {
            location_type: string
            location_name_1: string
            location_name_2?: string
            location_name_3?: string
            location_street_1: string
            location_street_2?: string
            location_street_3?: string
            rating_1?: number
            rating_2?: number
            rating_3?: number
        }

        if (placesNumber === 0) {
            tts += i18n.randomTranslation(`places.checkAround.${ searchVariable }.noResults`, {
                location_type: locationTypes[0] || 'place like this'
            })
        } else if (placesNumber === 1) {
            let parameters: Parameters = {
                location_type: locationTypes[0] || 'place like this',
                location_name_1: placesData.results[0].name,
                location_street_1: beautify.address(placesData.results[0].vicinity),
            }

            if (searchVariable === 'topRated') {
                parameters = {
                    ...parameters,
                    rating_1: placesData.results[0].rating
                }
            }

            tts += i18n.randomTranslation(`places.checkAround.${ searchVariable }.oneResult`, parameters)
        } else if (placesNumber === 2) {
            let parameters: Parameters = {
                location_type: locationTypes[0] || 'places',
                location_name_1: placesData.results[0].name,
                location_street_1: beautify.address(placesData.results[0].vicinity),
                location_name_2: placesData.results[1].name,
                location_street_2: beautify.address(placesData.results[1].vicinity),
            }

            if (searchVariable === 'topRated') {
                parameters = {
                    ...parameters,
                    rating_1: placesData.results[0].rating,
                    rating_2: placesData.results[1].rating
                }
            }

            tts += i18n.randomTranslation(`places.checkAround.${ searchVariable }.twoResults`, parameters)
        } else if (placesNumber > 2) {
            let parameters: Parameters = {
                location_type: locationTypes[0] || 'places',
                location_name_1: placesData.results[0].name,
                location_street_1: beautify.address(placesData.results[0].vicinity),
                location_name_2: placesData.results[1].name,
                location_street_2: beautify.address(placesData.results[1].vicinity),
                location_name_3: placesData.results[2].name,
                location_street_3: beautify.address(placesData.results[2].vicinity)
            }

            if (searchVariable === 'topRated') {
                parameters = {
                    ...parameters,
                    rating_1: placesData.results[0].rating,
                    rating_2: placesData.results[1].rating,
                    rating_3: placesData.results[2].rating
                }
            }

            tts += i18n.randomTranslation(`places.checkAround.${ searchVariable }.multipleResults`, parameters)
        }

        if (searchVariables.includes('open')) {
            tts += ' '
            if (placesNumber === 1) {
                tts += i18n.translate('places.open.oneResult')
            } else if (placesNumber > 1) {
                tts += i18n.translate('places.open.multipleResults')
            }
        }

        return tts
    },

    checkHoursToSpeech (locationName, address, dateTime, openingHours) {
        if (openingHours.openDate && openingHours.closeDate) {
            if (time.isToday(dateTime)) {
                return i18n.translate('places.checkHours.openingHours.openRangeToday', {
                    location: locationName,
                    address: beautify.address(address),
                    open_date: beautify.time(openingHours.openDate),
                    close_date: beautify.time(openingHours.closeDate)
                })
            } else if (!time.moreThanAWeek(dateTime)) {
                return i18n.translate('places.checkHours.nearFutureOpeningHours.openRangeToday', {
                    location: locationName,
                    address: beautify.address(address),
                    open_date: beautify.time(openingHours.openDate),
                    close_date: beautify.time(openingHours.closeDate),
                    day_in_week: time.dayToText(dateTime.getDay())
                })
            } else {
                return i18n.translate('places.checkHours.futureOpeningHours.openRangeToday', {
                    location: locationName,
                    address: beautify.address(address),
                    open_date: beautify.time(openingHours.openDate),
                    close_date: beautify.time(openingHours.closeDate),
                    day_in_week: `${ time.dayToText(dateTime.getDay()) }s`
                })
            }
        } else {
            return i18n.translate('places.checkHours.noOpeningHours', {
                location: locationName,
                address: beautify.address(address)
            })
        }
    },

    findContactToSpeech (locationName, contactForm, phoneNumber, address) {
        if (contactForm === 'number') {
            if (phoneNumber) {
                return i18n.translate('places.findContact.phoneNumber', {
                    location: locationName,
                    address: beautify.address(address),
                    phone_number: beautify.number(phoneNumber)
                })
            } else {
                return i18n.translate('places.findContact.noPhoneNumber', {
                    location: locationName,
                    address: beautify.address(address)
                })
            }
        } else {
            return i18n.translate('places.findContact.address', {
                location: locationName,
                address: address
            })
        }
    },

    checkDistanceToSpeech (locationName, address, distance) {
        return i18n.translate('places.checkDistance.distance', {
            location: locationName,
            address: beautify.address(address),
            distance: beautify.distance(distance)
        })
    }
}
