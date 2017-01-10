'use strict'

const Slapp = require('./slapp')

/**
 * Create a new Slapp, accepts an options object
 *
 * Parameters
 * - `opts.verify_token` Slack Veryify token to validate authenticity of requests coming from Slack
 * - `opts.convo_store` Implementation of ConversationStore, defaults to memory
 * - `opts.context` `Function (req, res, next)` HTTP Middleware function to enrich incoming request with context
 * - `opts.log` defaults to `true`, `false` to disable logging
 * - `opts.colors` defaults to `process.stdout.isTTY`, `true` to enable colors in logging
 * - `opts.ignoreSelf` defaults to `true`, `true` to automatically ignore any messages from yourself. This flag requires the context to set `meta.app_bot_id` with the Slack App's users.profile.bot_id.
 * - `opts.ignoreBots` defaults to `false`, `true` to ignore any messages from bot users automatically
 *
 * Example
 *
 *
 *     var Slapp = require('slapp')
 *     var BeepBoopConvoStore = require('slapp-convo-beepboop')
 *     var BeepBoopContext = require('slapp-context-beepboop')
 *     var slapp = Slapp({
 *       record: 'out.jsonl',
 *       context: BeepBoopContext(),
 *       convo_store: BeepBoopConvoStore({ debug: true })
 *     })
 *
 *
 * @param {Object} opts
 * @returns {Object} Slapp
 * @function slapp
 * @alias slapp
 */

function factory (opts) {
  let app = new Slapp(opts)

  return app.init()
}

module.exports = factory
