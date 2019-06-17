module.exports = {
    DEFAULT_LOCALE: 'english',
    SUPPORTED_LOCALES: [ 
        'english',
        'french'
    ],
    DEFAULT_LANGUAGE: 'en',
    LANGUAGE_MAPPINGS: {
        english: 'en',
        french: 'fr'
    },
    SEARCH_VARIABLES: {
        en: {
            top_rated: 'top rated',
            nearby: 'nearby',
            open: 'open'
        },
        fr: {
            top_rated: 'mieux noté',
            nearby: 'à proximité',
            open: 'ouvert'
        }
    },
    TOP_RATED_THRESHOLD: 4.0,
    DAY_MILLISECONDS: 1000 * 60 * 60 * 24,
    WEEK_MILLISECONDS: 1000 * 60 * 60 * 24 * 7,
    SEARCH_RADIUS: 50000,
    INTENT_PROBABILITY_THRESHOLD: 0.45,
    INTENT_FILTER_PROBABILITY_THRESHOLD: 0.5,
    SLOT_CONFIDENCE_THRESHOLD: 0.4,
    ASR_UTTERANCE_CONFIDENCE_THRESHOLD: 0.5
}
