module.exports = {
    beautifyLocationName: (locationTypes, locationNames) => {
        const locations = locationTypes.concat(locationNames)
        return locations.join(' ')
    }
}