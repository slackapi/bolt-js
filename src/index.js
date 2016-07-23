const SlackApp = require('./slackapp')

/**
 * Create a new SlackApp, accepts an options object
 *
 * Parameters
 * - `opts.app_token`   Slack App token override
 * - `opts.app_user_id` Slack App User ID (who installed the app)
 * - `opts.bot_token`   Slack App Bot token
 * - `opts.bot_user_id` Slack App Bot ID
 * - `opts.convo_store` Implementation of ConversationStore, defaults to memory
 * - `opts.error`       Error handler function `(error) => {}`
 *
 * Example
 *
 *
 *     var SlackApp = require('slackapp')
 *     var BeepBoopConvoStore = require('slackapp-convo-beepboop')
 *     var slackapp = SlackApp({
 *       debug: true,
 *       record: 'out.jsonl',
 *       convo_store: BeepBoopConvoStore({ debug: true }),
 *       error: (err) => { console.error('Error: ', err) }
 *     })
 *
 *
 * @param {Object} opts
 * @returns {Object} SlackApp
 * @function slackapp
 * @alias slackapp
 */

function factory (opts) {
  let app = new SlackApp(opts)

  return app.init()
}

module.exports = factory
