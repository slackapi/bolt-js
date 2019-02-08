import Slapp, { SlappOptions } from './Slapp';

/**
 * Create a new Slapp, accepts an options object
 *
 * Parameters
 * - `opts.verify_token` Slack Verify token to validate authenticity of requests coming from Slack
 * - `opts.signing_secret` Slack signing secret to check/verify the signature of requests coming from Slack
 * - `opts.signing_version` Slack signing version string, defaults to 'v0'
 * - `opts.convo_store` Implementation of ConversationStore, defaults to memory
 * - `opts.context` `Function (req, res, next)` HTTP Middleware function to enrich incoming request with context
 * - `opts.log` defaults to `true`, `false` to disable logging
 * - `opts.logger` Implementation of a logger, defaults to built-in Slapp command line logger.
 * - `opts.colors` defaults to `process.stdout.isTTY`, `true` to enable colors in logging
 * - `opts.ignoreSelf` defaults to `true`, `true` to automatically ignore any messages from yourself. This flag requires
 *    the context to set `meta.app_bot_id` with the Slack App's users.profile.bot_id.
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
 */

function factory(opts: SlappOptions): Slapp {
  return new Slapp(opts);
}

module.exports = factory;
