const {
    TOP_RATED_THRESHOLD
} = require('../../constants')

module.exports = {
    topRatedFilter: data => {
        data.results.sort((place_1, place_2) => place_2.rating - place_1.rating)
        return data.results.filter(place => place.rating > TOP_RATED_THRESHOLD)
    }
}