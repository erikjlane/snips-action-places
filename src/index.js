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
                    action: handlers.checkAround
                },
                {
                    intent: 'snips-assistant:FindContact',
                    action: handlers.findContact
                },
                {
                    intent: 'snips-assistant:CheckDistance',
                    action: handlers.checkDistance
                },
                {
                    intent: 'snips-assistant:CheckHours',
                    action: handlers.checkHours
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