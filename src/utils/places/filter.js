const {
    TOP_RATED_THRESHOLD
} = require('../../constants')

module.exports = {
    topRatedFilter: data => {
        return data.slots.reduce((acc, place) => {
            if (place.rating > TOP_RATED_THRESHOLD) {
                if (!acc)
                    return place
            }
            return acc
        }, null)
    }
}