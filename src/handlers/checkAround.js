
module.exports = async function(msg, flow, knownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

    logger.info('CheckAround')

    const {
        business_type,
        business_name,
        street_address
    } = commonHandler(msg, knownSlots)
}