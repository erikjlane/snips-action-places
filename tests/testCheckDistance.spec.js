require('./helpers/setup').bootstrap()
const Session = require('./helpers/session')
const { getMessageKey } = require('./helpers/tools')
const { configFactory } = require('../src/factories')
const {
    createLocationNameSlot
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
        intentName: 'snips-assistant:CheckDistance',
        input: 'What is the distance to the coolest Burger King?'
    })

    // In test mode, the i18n output is mocked as a JSON containing the i18n key and associated options.
    // (basically the arguments passed to i18n, in serialized string form)
    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)[0]).toBe('error.noCurrentCoordinates')
}, robustnessTestsTimeout)

it('should ask the missing location name', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:CheckDistance',
        input: 'What is the distance to the coolest Burger King?'
    })

    const whichDestinationMsg = await session.continue({
        intentName: 'snips-assistant:CheckDistance',
        input: 'What is the distance to the coolest Burger King?',
        slots: [
            createLocationNameSlot('Burger King')
        ]
    })
    expect(getMessageKey(whichDestinationMsg.text)).toBe('places.dialog.noLocation')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('places.checkDistance.distance')
}, robustnessTestsTimeout)

it('should ask the missing location name twice and pass', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:CheckDistance',
        input: 'What is the distance to the coolest Burger King?'
    })

    const whichDestinationMsg1 = await session.continue({
        intentName: 'snips-assistant:CheckDistance',
        input: 'What is the distance to the coolest Burger King?'
    })
    expect(getMessageKey(whichDestinationMsg1.text)).toBe('places.dialog.noLocation')

    const whichDestinationMsg2 = await session.continue({
        intentName: 'snips-assistant:CheckDistance',
        input: 'What is the distance to the coolest Burger King?',
        slots: [
            createLocationNameSlot('Burger King')
        ]
    })
    expect(getMessageKey(whichDestinationMsg2.text)).toBe('places.dialog.noLocation')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('places.checkDistance.distance')
}, robustnessTestsTimeout)

it('should ask the missing location name twice and fail', async () => {
    configFactory.mock({
        locale: 'english',
        current_region: 'us',
        current_coordinates: '40.6976637,-74.1197635',
        unit_system: 'metric'
    })

    const session = new Session()
    await session.start({
        intentName: 'snips-assistant:CheckDistance',
        input: 'What is the distance to the coolest Burger King?'
    })

    const whichDestinationMsg1 = await session.continue({
        intentName: 'snips-assistant:CheckDistance',
        input: 'What is the distance to the coolest Burger King?'
    })
    expect(getMessageKey(whichDestinationMsg1.text)).toBe('places.dialog.noLocation')

    const whichDestinationMsg2 = await session.continue({
        intentName: 'snips-assistant:CheckDistance',
        input: 'What is the distance to the coolest Burger King?'
    })
    expect(getMessageKey(whichDestinationMsg2.text)).toBe('places.dialog.noLocation')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)[0]).toBe('error.slotsNotRecognized')
}, robustnessTestsTimeout)

//TODO: change endpoints to allow search variables?
it('should query the distance to a Burger King', async () => {
    configFactory.mock({
        locale: 'english',
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

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('places.checkDistance.distance')
}, robustnessTestsTimeout)