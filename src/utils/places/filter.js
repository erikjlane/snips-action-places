const {
    TOP_RATED_THRESHOLD
} = require('../../constants')

module.exports = {
    topRatedFilter: data => {
        return data.results.filter(place => place.rating > TOP_RATED_THRESHOLD)
    }
}