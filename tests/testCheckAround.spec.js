require('./helpers/setup').bootstrap()
const Session = require('./helpers/session')
const { getMessageKey } = require('./helpers/tools')
const { configFactory } = require('../src/factories')
const {
    createLocationNameSlot,
    createLocationTypeSlot,
    createSearchVariableSlot
} = require('./utils')

const robustnessTestsTimeout = 60000

it('should ask to configure the current coordinates of the device', async () => {
    configFactory.mock({
        locale: 'english',
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
    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)[0]).toBe('error.noCurrentCoordinates')
}, robustnessTestsTimeout)

it('should break as neither the location name nor the location type is provided', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:CheckAround',
        input: 'How can I contact?'
    })

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)[0]).toBe('error.intentNotRecognized')
}, robustnessTestsTimeout)

it('should query the Burger King restaurants which are currently open', async () => {
    configFactory.mock({
        locale: 'english',
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

    const endMsg = (await session.end()).text
    expect(endMsg.includes('places.checkAround.prominence.multipleResults')).toBeTruthy()
    expect(endMsg.includes('places.open.multipleResults')).toBeTruthy()
}, robustnessTestsTimeout)

it('should query the nearest Burger King restaurants', async () => {
    configFactory.mock({
        locale: 'english',
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

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('places.checkAround.distance.multipleResults')
}, robustnessTestsTimeout)

it('should query the top rated Burger King restaurants', async () => {
    configFactory.mock({
        locale: 'english',
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

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('places.checkAround.topRated.oneResult')
}, robustnessTestsTimeout)