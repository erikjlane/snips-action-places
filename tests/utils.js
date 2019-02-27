
module.exports = {
    createLocationNameSlot(locationName) {
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
    },

    createLocationTypeSlot(locationType) {
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
    },

    createSearchVariableSlot(searchVariable) {
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
    },

    createContactFormSlot(contactForm) {
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
    },

    createDateTimeSlot(dateTime) {
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
}