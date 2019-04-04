require('./helpers/setup').bootstrap()
const Session = require('./helpers/session')
const { getMessageKey } = require('./helpers/tools')
const { configFactory } = require('../src/factories')
const {
    createLocationNameSlot,
    createContactFormSlot
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
        intentName: 'snips-assistant:FindContact',
        input: 'How can I contact?'
    })

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
        intentName: 'snips-assistant:FindContact',
        input: 'How can I contact?'
    })

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)[0]).toBe('error.intentNotRecognized')
}, robustnessTestsTimeout)

it('should ask the missing contact form and pass', async () => {
    configFactory.mock({
        locale: 'english',
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

    const whichContactFormMsg = await session.continue({
        intentName: 'snips-assistant:ElicitContactForm',
        input: 'By phone',
        slots: [
            createContactFormSlot('number')
        ]
    })
    expect(getMessageKey(whichContactFormMsg.text)).toBe('places.dialog.noContactForm')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('places.findContact.phoneNumber')
}, robustnessTestsTimeout)

it('should ask the missing contact form twice and pass', async () => {
    configFactory.mock({
        locale: 'english',
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

    const whichContactFormMsg1 = await session.continue({
        intentName: 'snips-assistant:ElicitContactForm',
        input: 'By phone'
    })
    expect(getMessageKey(whichContactFormMsg1.text)).toBe('places.dialog.noContactForm')

    const whichContactFormMsg2 = await session.continue({
        intentName: 'snips-assistant:ElicitContactForm',
        input: 'By phone',
        slots: [
            createContactFormSlot('number')
        ]
    })
    expect(getMessageKey(whichContactFormMsg2.text)).toBe('places.dialog.noContactForm')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('places.findContact.phoneNumber')
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
        intentName: 'snips-assistant:FindContact',
        input: 'How can I contact Burger King?',
        slots: [
            createLocationNameSlot('Burger King')
        ]
    })

    const whichContactFormMsg1 = await session.continue({
        intentName: 'snips-assistant:ElicitContactForm',
        input: 'By phone'
    })
    expect(getMessageKey(whichContactFormMsg1.text)).toBe('places.dialog.noContactForm')

    const whichContactFormMsg2 = await session.continue({
        intentName: 'snips-assistant:ElicitContactForm',
        input: 'By phone'
    })
    expect(getMessageKey(whichContactFormMsg2.text)).toBe('places.dialog.noContactForm')

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)[0]).toBe('error.slotsNotRecognized')
}, robustnessTestsTimeout)

it('should query the address of a Burger King', async () => {
    configFactory.mock({
        locale: 'english',
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

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('places.findContact.address')
}, robustnessTestsTimeout)

it('should query the phone number of a Burger King', async () => {
    configFactory.mock({
        locale: 'english',
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

    const endMsg = (await session.end()).text
    expect(getMessageKey(endMsg)).toBe('places.findContact.phoneNumber')
}, robustnessTestsTimeout)