import { handler, ConfidenceThresholds } from 'snips-toolkit'
import { checkAroundHandler } from './checkAround'
import { findContactHandler } from './findContact'
import { checkDistanceHandler } from './checkDistance'
import { checkHoursHandler } from './checkHours'
import { INTENT_PROBABILITY_THRESHOLD, ASR_UTTERANCE_CONFIDENCE_THRESHOLD } from '../constants'

const thresholds: ConfidenceThresholds = {
    intent: INTENT_PROBABILITY_THRESHOLD,
    asr: ASR_UTTERANCE_CONFIDENCE_THRESHOLD
}

// Add handlers here, and wrap them.
export default {
    checkAround: handler.wrap(checkAroundHandler, thresholds),
    findContact: handler.wrap(findContactHandler, thresholds),
    checkDistance: handler.wrap(checkDistanceHandler, thresholds),
    checkHours: handler.wrap(checkHoursHandler, thresholds)
}
