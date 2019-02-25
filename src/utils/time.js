const { i18nFactory } = require('../factories')
const {
    DAY_MILLISECONDS,
    WEEK_MILLISECONDS
} = require('../constants')

module.exports = {
    isToday (date) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const interval = {
            min: today.getTime(),
            max: today.getTime() + DAY_MILLISECONDS
        }

        return date.getTime() >= interval.min && date.getTime() < interval.max
    },

    isTomorrow (date) {
        const tomorrow = new Date(Date.now() + DAY_MILLISECONDS)
        tomorrow.setHours(0, 0, 0, 0)
        const interval = {
            min: tomorrow.getTime(),
            max: tomorrow.getTime() + DAY_MILLISECONDS
        }

        return date.getTime() >= interval.min && date.getTime() <= interval.max
    },

    moreThanAWeek (date) {
        const week = new Date(Date.now() + WEEK_MILLISECONDS)
        week.setHours(0, 0, 0, 0)

        return date.getTime() >= week.getTime() + DAY_MILLISECONDS
    },

    dayToText (day) {
        const i18n = i18nFactory.get()

        switch (day) {
            case 0:
                return i18n('days.sunday')
            case 1:
                return i18n('days.monday')
            case 2:
                return i18n('days.tuesday')
            case 3:
                return i18n('days.wednesday')
            case 4:
                return i18n('days.thursday')
            case 5:
                return i18n('days.friday')
            case 6:
                return i18n('days.saturday')
            default:
                return undefined
        }
    }
}