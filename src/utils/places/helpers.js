const { debug } = require('../logger')

module.exports = {
    extractOpeningHours: (date, placeData) => {
        let openDate, closeDate

        if (placeData.result && placeData.result.opening_hours && placeData.result.opening_hours.periods) {
            const periods = placeData.result.opening_hours.periods
            const day = date.getDay()
            
            debug(periods)

            for (let obj of periods) {
                if (obj.open && obj.open.day === day) {
                    openDate = new Date(date.getTime())
                    openDate.setHours(obj.open.time.substring(0, 2), obj.open.time.substring(2), 0, 0)
                }
                if (obj.close && obj.close.day === day) {
                    closeDate = new Date(date.getTime())
                    closeDate.setHours(obj.close.time.substring(0, 2), obj.close.time.substring(2), 0, 0)
                }
            }
        }

        return { openDate, closeDate }
    }
}