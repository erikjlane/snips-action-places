import { i18n } from 'snips-toolkit'
import { DAY_MILLISECONDS, WEEK_MILLISECONDS } from '../constants'

export const time = {
    isToday (date: Date): boolean {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const interval = {
            min: today.getTime(),
            max: today.getTime() + DAY_MILLISECONDS
        }

        return date.getTime() >= interval.min && date.getTime() < interval.max
    },

    isTomorrow (date: Date): boolean {
        const tomorrow = new Date(Date.now() + DAY_MILLISECONDS)
        tomorrow.setHours(0, 0, 0, 0)
        const interval = {
            min: tomorrow.getTime(),
            max: tomorrow.getTime() + DAY_MILLISECONDS
        }

        return date.getTime() >= interval.min && date.getTime() <= interval.max
    },

    moreThanAWeek (date: Date): boolean {
        const week = new Date(Date.now() + WEEK_MILLISECONDS)
        week.setHours(0, 0, 0, 0)

        return date.getTime() >= week.getTime() + DAY_MILLISECONDS
    },

    dayToText (day: number): string {
        switch (day) {
            case 0:
                return i18n.translate('days.sunday')
            case 1:
                return i18n.translate('days.monday')
            case 2:
                return i18n.translate('days.tuesday')
            case 3:
                return i18n.translate('days.wednesday')
            case 4:
                return i18n.translate('days.thursday')
            case 5:
                return i18n.translate('days.friday')
            case 6:
                return i18n.translate('days.saturday')
            default:
                return undefined
        }
    }
}
