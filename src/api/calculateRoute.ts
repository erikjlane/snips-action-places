import { request } from './index'

export async function calculateRoute (origin, placeId) {
    const query = {
        origin,
        destination: `place_id:${ placeId }`
    }

    const results = await request
        .url('/directions/json')
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
