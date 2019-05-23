export const BASE_URL = 'https://maps.googleapis.com/maps/api'
export const TOP_RATED_THRESHOLD = 4.0
export const DAY_MILLISECONDS = 1000 * 60 * 60 * 24
export const WEEK_MILLISECONDS = 1000 * 60 * 60 * 24 * 7
export const SEARCH_RADIUS = 50000
export const INTENT_PROBABILITY_THRESHOLD = 0.45
export const INTENT_FILTER_PROBABILITY_THRESHOLD = 0.5
export const SLOT_CONFIDENCE_THRESHOLD = 0.4
export const ASR_UTTERANCE_CONFIDENCE_THRESHOLD = 0.5
export const SEARCH_VARIABLES = {
    english: {
        popular: 'popular',
        top_rated: 'top rated',
        nearby: 'nearby',
        open: 'open'
    },
    fr: {
        popular: 'populaire',
        top_rated: 'mieux noté',
        nearby: 'à proximité',
        open: 'ouvert'
    }
}
