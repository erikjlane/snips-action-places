import { Test } from 'snips-toolkit'
import {
    createLocationNameSlot,
    createDateTimeSlot,
    mockConfig
} from './utils'

const { Session, Tools} = Test
const { getMessageKey } = Tools

import './mocks/http'

const robustnessTestsTimeout = 60000

it('should ask to configure the current coordinates of the device', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'us',
        current_coordinates: '',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:CheckHours',
        input: 'What are the opening hours for Burger King?'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noCurrentCoordinates')
}, robustnessTestsTimeout)

it('should break as neither the location name nor the location type is provided', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:CheckHours',
        input: 'How can I contact?'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.intentNotRecognized')
}, robustnessTestsTimeout)

it('should query the opening hours of a Burger King', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:CheckHours',
        input: 'What are the opening hours for Burger King?',
        slots: [
            createLocationNameSlot('Burger King')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('places.checkHours.openingHours.openRangeToday')
}, robustnessTestsTimeout)

it('should query the future opening hours of a Burger King', async () => {
    mockConfig({
        locale: 'english',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:CheckHours',
        input: 'What will the opening hours for Burger King be in 2021?',
        slots: [
            createLocationNameSlot('Burger King'),
            createDateTimeSlot('2021-02-12 22:00:00 +00:00')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('places.checkHours.futureOpeningHours.openRangeToday')
}, robustnessTestsTimeout)