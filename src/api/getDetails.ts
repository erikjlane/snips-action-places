import { config } from 'snips-toolkit'
import { request } from './index'

export async function getDetails (placeId) {
    const query = {
        placeid: placeId,
        region: config.get().currentRegion
    }

    const results = await request
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
}
