import { camelize } from 'snips-toolkit'

export const mockConfig = conf => {
    SnipsToolkit.mock.config(config => {
        Object.assign(config, camelize.camelizeKeys(conf))
    })
}

export function createLocationNameSlot(locationName) {
    return {
        slotName: 'location_name',
        entity: 'location_us_custom',
        confidenceScore: 1,
        rawValue: locationName,
        value: {
            kind: 'Custom',
            value: locationName
        },
        range: {
            start: 0,
            end: 1
        }
    }
}

export function createLocationTypeSlot(locationType) {
    return {
        slotName: 'location_type',
        entity: 'businessTypeEn',
        confidenceScore: 1,
        rawValue: locationType,
        value: {
            kind: 'Custom',
            value: locationType
        },
        range: {
            start: 0,
            end: 1
        }
    }
}

export function createSearchVariableSlot(searchVariable) {
    return {
        slotName: 'search_variable',
        entity: 'localBusinessSearchVariableEN',
        confidenceScore: 1,
        rawValue: searchVariable,
        value: {
            kind: 'Custom',
            value: searchVariable
        },
        range: {
            start: 0,
            end: 1
        }
    }
}

export function createContactFormSlot(contactForm) {
    return {
        slotName: 'contact_form',
        entity: 'contactFormEN',
        confidenceScore: 1,
        rawValue: contactForm,
        value: {
            kind: 'Custom',
            value: contactForm
        },
        range: {
            start: 0,
            end: 1
        }
    }
}

export function createDateTimeSlot(dateTime) {
    return {
        slotName: 'date_time',
        entity: 'snips/datetime',
        confidenceScore: 1,
        rawValue: dateTime,
        value: {
            kind: 'InstantTime',
            value: dateTime,
            grain: 'Hour',
            precision: 'Exact'
        },
        range: {
            start: 0,
            end: 1
        }
    }
}
