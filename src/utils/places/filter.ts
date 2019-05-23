import { TOP_RATED_THRESHOLD } from '../../constants'

export function topRatedFilter(data) {
    data.results.sort((place_1, place_2) => place_2.rating - place_1.rating)
    return data.results.filter(place => place.rating > TOP_RATED_THRESHOLD)
}
