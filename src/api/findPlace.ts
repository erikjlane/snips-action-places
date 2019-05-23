import { config } from 'snips-toolkit'
import { request } from './index'
import { SEARCH_RADIUS } from '../constants'

export async function findPlace (keyword: string) {
    const query: {
        inputtype: string,
        input: string,
        locationbias: string
    } = {
        inputtype: 'textquery',
        input: keyword,
        locationbias: `circle:${ SEARCH_RADIUS }@${ config.get().currentCoordinates }`
    }

    const results = await request
        .url('/place/findplacefromtext/json')
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
