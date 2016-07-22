const SlackApp = require('./slackapp')

/**
 * Initialize a SlackApp, accepts an options object
 *
 * Options:
 * - `app_token`   Slack App token
 * - `app_user_id` Slack App User ID (who installed the app)
 * - `bot_token`   Slack App Bot token
 * - `bot_user_id` Slack App Bot ID
 * - `convo_store` `string` of type of Conversation store (`memory`, etc.) or `object` implementation
 * - `error`       Error handler function `(error) => {}`
 */
module.exports = (opts) => {
  let app = new SlackApp(opts)

  return app.init()
}
