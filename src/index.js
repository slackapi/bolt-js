'use strict'

const Slapp = require('./slapp')

/**
 * Create a new Slapp, accepts an options object
 *
 * Parameters
 * - `opts.verify_token` Slack Veryify token to validate authenticity of requests coming from Slack
 * - `opts.convo_store` Implementation of ConversationStore, defaults to memory
 * - `opts.tokens_lookup` `Function (req, res, next)` HTTP Middleware function to enrich incoming request with tokens
 * - `opts.log` defaults to `true`, `false` to disable logging
 * - `opts.colors` defaults to `true`, `false` to disable colors in logging
 *
 * Example
 *
 *
 *     var Slapp = require('slapp')
 *     var BeepBoopConvoStore = require('slapp-convo-beepboop')
 *     var slapp = Slapp({
 *       record: 'out.jsonl',
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
