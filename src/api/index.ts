import { BASE_URL } from '../constants'
import { http, config } from 'snips-toolkit'

export let request = http(BASE_URL)

export function init() {
    request = request.query({
        language: config.get().locale,
        key: config.get().apiKey
    })
}

export * from './calculateRoute'
export * from './findPlace'
export * from './getDetails'
export * from './nearbySearch'