import { config } from 'snips-toolkit'
import { request } from './index'
import { SEARCH_RADIUS } from '../constants'

export async function nearbySearch (keyword: string, rankby: string = 'prominence', opennow: boolean = false, radius: number = SEARCH_RADIUS) {
    let query: {
        location: string,
        keyword: string,
        rankby: string,
        opennow: boolean,
        radius?: number
    } = {
        location: config.get().currentCoordinates,
        keyword,
        rankby,
        opennow
    }

    if (rankby !== 'distance') {
        query = {
            ...query,
            radius
        }
    }

    const results = await request
        .url('/place/nearbysearch/json')
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
