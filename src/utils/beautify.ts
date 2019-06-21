import { config, i18n } from 'snips-toolkit'

function metersToFeet(distance: number): number {
    return distance * 3.28084
}

function round(value: number, precision: number = 0) {
    const multiplier = Math.pow(10, precision)
    return Math.round(value * multiplier) / multiplier
}

export const beautify = {
    time: (date: Date): string => {
        const options = { hour: 'numeric', minute: 'numeric' }

        if (config.get().locale === 'fr') {
            // French
            return date.toLocaleString('fr-FR', {
                ...options,
                hour12: false
            }).replace(':', ' heure ').replace(' 00', '')
        } else {
            // English
            return date.toLocaleString('en-US', {
                ...options,
                hour12: true
            }).replace(':', ' ').replace(' 00','')
        }
    },

    address: (address: string): string => {
        if (config.get().locale === 'en') {
            address = address.replace(/(.*)( Av| AV| Av\.| Ave)(\/|$|-|,| )(.*)/g, '$1 Avenue$3$4')
            address = address.replace(/(.*)( Rd)(\/|$|-|,| )(.*)/g, '$1 Road$3$4')
            address = address.replace(/(.*)( St| ST)(\/|$|-|,| )(.*)/g, '$1 Street$3$4')
            address = address.replace(/(.*)( Pk)(\/|$|-|,| )(.*)/g, '$1 Park$3$4')
            address = address.replace(/(.*)( Blvd)(\/|$|-|,| )(.*)/g, '$1 Boulevard$3$4')
            address = address.replace(/(.*)\/(.*)/g, '$1 $2')
        }

        return address
    },

    distance: (distance: number): string => {
        if (config.get().unitSystem === 'imperial') {
            distance = metersToFeet(distance)

            if (distance > 5280) {
                distance = round(distance / 5280, 1)
                return i18n.translate('units.distance.imperial.miles', { distance })
            } else {
                distance = 100 * Math.floor(distance / 100)
                return i18n.translate('units.distance.imperial.feet', { distance })
            }
        } else {
            if (distance > 999) {
                distance /= 1000

                if (distance > 20) {
                    distance = Math.round(distance)
                } else {
                    distance = round(distance, 1)
                }

                return i18n.translate('units.distance.metric.kilometers', { distance })
            } else {
                distance = 10 * Math.floor(distance / 10)
                return i18n.translate('units.distance.metric.meters', { distance })
            }
        }
    },

    number: number => {
        return number.replace(/[()]/g, '')
    }
}
