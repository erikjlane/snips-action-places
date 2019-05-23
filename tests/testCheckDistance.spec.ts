import { Test } from 'snips-toolkit'
import {
    createLocationNameSlot,
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
        intentName: 'snips-assistant:CheckDistance',
        input: 'What is the distance to the coolest Burger King?'
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
        intentName: 'snips-assistant:CheckDistance',
        input: 'How can I contact?'
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)[0]).toBe('error.intentNotRecognized')
}, robustnessTestsTimeout)

//TODO: change endpoints to allow search variables?
it('should query the distance to a Burger King', async () => {
    mockConfig({
        locale: 'en',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:CheckDistance',
        input: 'What is the distance to the coolest Burger King?',
        slots: [
            createLocationNameSlot('Burger King')
        ]
    })

    const endMsg = await session.end()
    expect(getMessageKey(endMsg)).toBe('places.checkDistance.distance')
}, robustnessTestsTimeout)
