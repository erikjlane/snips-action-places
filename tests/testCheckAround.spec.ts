import { Test } from 'snips-toolkit'
import {
    createLocationNameSlot,
    createLocationTypeSlot,
    createSearchVariableSlot,
    mockConfig
} from './utils'

const { Session, Tools} = Test
const { getMessageKey } = Tools

import './mocks/http'

const robustnessTestsTimeout = 60000

SnipsToolkit.mock.config(config => {
    config.apiKey = 'fake_api_key'
})

it('should ask to configure the current coordinates of the device', async () => {
    mockConfig({
        locale: 'en',
        current_region: 'us',
        current_coordinates: '',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:CheckAround',
        input: 'Any Burger King around?'
    })

    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)
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
        intentName: 'snips-assistant:CheckAround',
        input: 'How can I contact?'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.intentNotRecognized')
}, robustnessTestsTimeout)

it('should query the Burger King restaurants which are currently open', async () => {
    mockConfig({
        locale: 'en',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:CheckAround',
        input: 'Any open Burger King around?',
        slots: [
            createLocationNameSlot('Burger King'),
            createSearchVariableSlot('open')
        ]
    })

    const endMsg = await session.end()
    expect(endMsg.text && endMsg.text.includes('places.checkAround.prominence.multipleResults')).toBeTruthy()
    expect(endMsg.text && endMsg.text.includes('places.open.multipleResults')).toBeTruthy()
}, robustnessTestsTimeout)

it('should query the nearest Burger King restaurants', async () => {
    mockConfig({
        locale: 'en',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:CheckAround',
        input: 'Any open Burger King nearby?',
        slots: [
            createLocationNameSlot('Burger King'),
            createSearchVariableSlot('nearby')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('places.checkAround.distance.multipleResults')
}, robustnessTestsTimeout)

it('should query the top rated Burger King restaurants', async () => {
    mockConfig({
        locale: 'en',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:CheckAround',
        input: 'Any open Burger King around?',
        slots: [
            createLocationNameSlot('Burger King'),
            createLocationTypeSlot('restaurant'),
            createSearchVariableSlot('top rated')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('places.checkAround.topRated.oneResult')
}, robustnessTestsTimeout)
