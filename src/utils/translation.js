const i18nFactory = require('../factories/i18nFactory')

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

    nearbySearchToSpeech (locationType, locationName, searchVariable, placesData) {
        const { randomTranslation } = module.exports

        const placesNumber = placesData.results.length

        let tts = ''

        if (placesNumber === 0) {
            tts += randomTranslation('places.checkAround.noResults', {
                location: `${ locationType } ${ locationName }`
            })
        } else if (placesNumber === 1) {
            tts += randomTranslation('places.checkAround.oneResult', {
                location: `${ locationType } ${ locationName }`
            })
        } else {
            tts += randomTranslation('places.checkAround.multipleResults', {
                location: `${ locationType } ${ locationName }`,
                number: placesNumber
            })
        }

        return tts
    }
}