import { Test } from 'snips-toolkit'
import {
    createLocationNameSlot,
    createContactFormSlot,
    mockConfig
} from './utils'

const { Session, Tools} = Test
const { getMessageKey } = Tools

import './mocks/http'

const robustnessTestsTimeout = 60000

it('should ask to configure the current coordinates of the device', async () => {
    mockConfig({
        locale: 'en',
        current_region: 'us',
        current_coordinates: '',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:FindContact',
        input: 'How can I contact?'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.noCurrentCoordinates')
}, robustnessTestsTimeout)

it('should break as neither the location name nor the location type is provided', async () => {
    mockConfig({
        locale: 'en',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:FindContact',
        input: 'How can I contact?'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.intentNotRecognized')
}, robustnessTestsTimeout)

it('should query the address of a Burger King', async () => {
    mockConfig({
        locale: 'en',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:FindContact',
        input: 'How can I contact Burger King?',
        slots: [
            createLocationNameSlot('Burger King'),
            createContactFormSlot('address')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('places.findContact.address')
}, robustnessTestsTimeout)

it('should query the phone number of a Burger King', async () => {
    mockConfig({
        locale: 'en',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:FindContact',
        input: 'What will the opening hours for Burger King be in 2021?',
        slots: [
            createLocationNameSlot('Burger King'),
            createContactFormSlot('number')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('places.findContact.phoneNumber')
}, robustnessTestsTimeout)

it('should query the phone number of a Burger King as the contact form is not given and pass', async () => {
    mockConfig({
        locale: 'en',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:FindContact',
        input: 'How can I contact Burger King?',
        slots: [
            createLocationNameSlot('Burger King')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('places.findContact.phoneNumber')
}, robustnessTestsTimeout)
