const { withHermes } = require('hermes-javascript')
const bootstrap = require('./bootstrap')
const handlers = require('./handlers')
const { translation, logger } = require('./utils')

// Initialize hermes
module.exports = function ({
    hermesOptions = {},
    bootstrapOptions = {}
} = {}) {
    withHermes(async (hermes, done) => {
        try {
            // Bootstrap config, locale, i18n…
            await bootstrap(bootstrapOptions)
            const dialog = hermes.dialog()

            dialog.flows([
                {
                    intent: 'snips-assistant:CheckAround',
                    action: (msg, flow) => handlers.checkAround(msg, flow, hermes)
                },
                {
                    intent: 'snips-assistant:FindContact',
                    action: (msg, flow) => handlers.findContact(msg, flow, hermes)
                },
                {
                    intent: 'snips-assistant:CheckDistance',
                    action: (msg, flow) => handlers.checkDistance(msg, flow, hermes)
                },
                {
                    intent: 'snips-assistant:CheckHours',
                    action: (msg, flow) => handlers.checkHours(msg, flow, hermes)
                }
            ])
        } catch (error) {
            // Output initialization errors to stderr and exit
            const message = await translation.errorMessage(error)
            logger.error(message)
            logger.error(error)
            // Exit
            done()
        }
    }, hermesOptions)
}