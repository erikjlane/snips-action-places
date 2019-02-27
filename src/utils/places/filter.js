module.exports = {
    topRatedFilter: data => {
        return data.results.sort((place_1, place_2) => place_2.rating - place_1.rating)
    }
}