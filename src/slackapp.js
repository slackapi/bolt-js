'use strict'

const slack = require('slack')
const conversationStore = require('./conversation_store')
const Receiver = require('./receiver')

/**
 * `slackapp` exposes a factory that takes an options object.
 *
 * ```
 *     var SlackApp = require('slackapp')
 *     var slackapp = SlackApp(opts)
 * ```
 *
 * @class
 * @param {Object} opts
 * @param {string} opts.app_token - Slack App token override
 * @param {string} opts.app_user_id - Slack App User ID (who installed the app)
 * @param {string} opts.bot_token - Slack App Bot token
 * @param {string} opts.bot_user_id - Slack App Bot ID
 * @param {Object} opts.convo_store - Implementation of ConversationStore, defaults to memory
 * @param {string} opts.error - Error handler function `(error) => {}`
 * @returns {Object} SlackApp
 */

module.exports = class SlackApp {

  /**
   * SlackApp constructor
   *
   * Documented in index.js
   * @private
   */

  constructor (opts) {
    opts = opts || {}
    this._middleware = []
    this._matchers = []
    this._registry = {}

    this.app_token = opts.app_token
    this.app_user_id = opts.app_user_id
    this.bot_token = opts.bot_token
    this.bot_user_id = opts.bot_user_id
    this.debug = opts.debug

    // If convo_store is a string, initialize that type of conversation store
    // If it's not a sting and it is defined, assume it is an impmementation of
    // a converation store
    if (opts.convo_store) {
      if (typeof opts.convo_store === 'string') {
        this.convoStore = conversationStore({ type: opts.convo_store })
      } else {
        this.convoStore = opts.convo_store
      }
    } else {
      this.convoStore = conversationStore()
    }

    this.onError = opts.error || (() => {})
    this.client = slack
    this.receiver = new Receiver(opts)
  }

  /**
   * Initialize app w/ default middleware and receiver listener
   *
   * @private
   */
  init () {
    // call `handle` for each new request
    // TODO: make overridable for testing
    this.receiver.on('message', this._handle.bind(this))
    this.use(this.ignoreBotsMiddleware())
    this.use(this.preprocessConversationMiddleware())

    return this
  }

  /**
   * Middleware that gets an existing conversation from the conversation store
   * or initialize a new one.
   *
   * @private
   */

  preprocessConversationMiddleware () {
    return (msg, next) => {
      this.convoStore.get(msg.conversation_id, (err, val) => {
        if (err) {
          return this.onError(err)
        }

        if (val) {
          msg.attachOverrideRoute(val.fnKey, val.state)
        }

        next()
      })
    }
  }

  /**
   * Middleware that ignores messages from any bot user when we can tell
   *
   * @private
   */

  ignoreBotsMiddleware () {
    return (msg, next) => {
      // avoid the case where both user_id and bot_user_id not set
      if (msg.meta.bot_id || (msg.meta.user_id && msg.meta.user_id === msg.meta.bot_user_id)) {
        return
      }
      next()
    }
  }


  /**
   * Register a new middleware, considered in order of registration
   * @param {function} fn - (msg, next) => { }
   * @param {message} fn.msg - instance of message
   * @param {function} fn.next - next callback
   */

  use (fn) {
    this._middleware.push(fn)

    return this
  }

  /**
   * Handle new events (slack events, commands, actions, webhooks, etc.)
   * Parameters
   * - `msg` `Message`
   * - `done` `function(err, bool)` Callback called once complete, called with error and boolean indicating message was handled [optional]
   *
   * @private
   */

  _handle (msg, done) {
    done = done || (() => {})
    let self = this
    msg.attachSlackApp(self)
    let idx = 0

    let next = () => {
      let current = idx++
      if (self._middleware[current]) {
        self._middleware[current](msg, next)
        return
      }

      // is there a conversation override?
      if (msg.override) {
        self.convoStore.del(msg.conversation_id, (err) => {
          if (err) {
            this.onError(err)
          }
          // invoking override w/o context explicitly
          // don't want to confuse consumers w/ a msg as `this` scope
          msg.override.call(null, msg)

          done(err || null, true)
        })
        return
      }

      // consider the matchers
      for (let i = 0; i < self._matchers.length; i++) {
        // if match is a regex, text the regex against the text of a message (if it is a message)
        let matcher = self._matchers[i]
        if (matcher(msg)) {
          return done(null, true)
        }
      }

      done(null, false)
    }

    next()

    return this
  }

  /**
   * Attach HTTP routes to an [Express](https://expressjs.com/) app and registers the following routes:
   * - `POST` `/slack-event`
   * - `POST` `/slack-command`
   * - `POST` `/slack-action`
   *
   * @param {Object} app - instance of an express app
   *
   */

  attachToExpress (app) {
    return this.receiver.attachToExpress(app)
  }

  /**
   * Register a new function route
   *
   * @param {string} fnKey - unique function key
   * @param {function} fn - callback (msg) => {}
   * @param {message} fn.msg - instance of message
   */

  route (fnKey, fn) {
    this._registry[fnKey] = fn

    return this
  }

  /**
   * Return a registered route
   *
   * @param {string} fnKey - unique function key
   */

  getRoute (fnKey) {
    return this._registry[fnKey]
  }

  /**
   * Register a custom Match function (fn)

   * $eturns `true` if there is a match AND you handled the msg.
   * Return `false` if there is not a match and you pass on the message.

   * All of the higher level matching convenience functions
   * generate a match function and call match to register it.
   *
   * Only one matcher can return true and they are executed in the order they are
   * defined. Match functions should return as fast as possible because it's important
   * that they are efficient. However you may do asyncronous tasks within to
   * your hearts content.
   *
   * @param {function} fn - match function `(msg) => { return bool }`
   * @param {message} fn.msg - instance of Message
   * @return {boolean} - was a match found and the message handled (otherwise continue looking)
   */

  match (fn) {
    this._matchers.push(fn)

    return this
  }

  /**
   * Register a new message handler function for the provided criteria. Types should be one or
   * more of:
   *
   * - `direct_message`
   * - `direct_mention`
   * - `mention`
   * - `ambient`
   * -  default: matches all if none provided
   *
   * @param {(string|RegExp)} criteria - string of a regular expression or RexExp object
   * @param {(string=|Array=)} typeFilter - list of types or string if just one
   * @param {function} callback - (msg) => {}
   * @param {message} callback.msg - instance of Message
   * @example `msg` object:
   *
   *    {
   *       "token":"dxxxxxxxxxxxxxxxxxxxx",
   *       "team_id":"TXXXXXXXX",
   *       "api_app_id":"AXXXXXXXX",
   *       "event":{
   *          "type":"message",
   *          "user":"UXXXXXXXX",
   *          "text":"hello!",
   *          "ts":"1469130107.000088",
   *          "channel":"DXXXXXXXX"
   *       },
   *       "event_ts":"1469130107.000088",
   *       "type":"event_callback",
   *       "authed_users":[
   *          "UXXXXXXXX"
   *       ]
   *    }
   */

  message (criteria, typeFilter, callback) {
    if (typeof criteria === 'string') {
      criteria = new RegExp(criteria, 'i')
    }
    if (typeof typeFilter === 'function') {
      callback = typeFilter
      typeFilter = []
    }
    if (typeof typeFilter === 'string') {
      typeFilter = [typeFilter]
    }

    let fn = (msg) => {
      if (msg.isMessage()) {
        let text = msg.stripDirectMention()
        if (criteria.test(text) && (typeFilter.length === 0 || msg.isAnyOf(typeFilter))) {
          callback(msg, text)
          return true
        }
      }
    }
    return this.match(fn)
  }

  /**
   * Register a new event handler for an actionName
   *
   * @param {(string|RegExp)} criteria - type of event or RegExp for more flexible matching
   * @param {function} callback - (msg) => {}
   * @param {message} callback.msg - instance of Message
   * @example `msg` object:
   *
   *    {
   *       "token":"dxxxxxxxxxxxxxxxxxxxx",
   *       "team_id":"TXXXXXXXX",
   *       "api_app_id":"AXXXXXXXX",
   *       "event":{
   *          "type":"reaction_added",
   *          "user":"UXXXXXXXX",
   *          "item":{
   *             "type":"message",
   *             "channel":"DXXXXXXXX",
   *             "ts":"1469130181.000096"
   *          },
   *          "reaction":"grinning"
   *       },
   *       "event_ts":"1469131201.822817",
   *       "type":"event_callback",
   *       "authed_users":[
   *          "UXXXXXXXX"
   *       ]
   *    }
   */

  event (criteria, callback) {
    if (typeof criteria === 'string') {
      criteria = new RegExp('^' + criteria + '$', 'i')
    }
    let fn = (msg) => {
      if (msg.type === 'event' && msg.body.event && criteria.test(msg.body.event.type)) {
        callback(msg)
        return true
      }
    }

    return this.match(fn)
  }

  /**
   * Register a new action handler for an actionNameCriteria
   *
   * @param {string} callbackId - Slack interactive message callback_id
   * @param {(string|RegExp)=} actionNameCriteria - type of action or RegExp for more flexible matching
   * @param {function} callback - (msg) => {}
   * @param {message} callback.msg - instance of Message
   * @example `msg` object:
   *
   * {
   *    "actions":[
   *       {
   *          "name":"answer",
   *          "value":":wine_glass:"
   *       }
   *    ],
   *    "callback_id":"in_or_out_callback",
   *    "team":{
   *       "id":"TXXXXXXXX",
   *       "domain":"companydomain"
   *    },
   *    "channel":{
   *       "id":"DXXXXXXXX",
   *       "name":"directmessage"
   *    },
   *    "user":{
   *       "id":"UXXXXXXXX",
   *       "name":"mike.brevoort"
   *    },
   *    "action_ts":"1469129995.067370",
   *    "message_ts":"1469129988.000084",
   *    "attachment_id":"1",
   *    "token":"dxxxxxxxxxxxxxxxxxxxx",
   *    "original_message":{
   *       "text":"What?",
   *       "username":"In or Out",
   *       "bot_id":"BXXXXXXXX",
   *       "attachments":[
   *          {
   *             "callback_id":"in_or_out_callback",
   *             "fallback":"Pick one",
   *             "id":1,
   *             "actions":[
   *                {
   *                   "id":"1",
   *                   "name":"answer",
   *                   "text":":beer:",
   *                   "type":"button",
   *                   "value":":beer:",
   *                   "style":""
   *                },
   *                {
   *                   "id":"2",
   *                   "name":"answer",
   *                   "text":":beers:",
   *                   "type":"button",
   *                   "value":":wine:",
   *                   "style":""
   *                },
   *             ]
   *          },
   *          {
   *             "text":":beers: • mike.brevoort",
   *             "id":2,
   *             "fallback":"who picked beers"
   *          }
   *       ],
   *       "type":"message",
   *       "subtype":"bot_message",
   *       "ts":"1469129988.000084"
   *    },
   *    "response_url":"https://hooks.slack.com/actions/TXXXXXXXX/111111111111/txxxxxxxxxxxxxxxxxxxx"
   *
   */

  action (callbackId, actionNameCriteria, callback) {
    if (typeof actionNameCriteria === 'function') {
      callback = actionNameCriteria
      actionNameCriteria = /.*/
    }

    if (typeof actionNameCriteria === 'string') {
      actionNameCriteria = new RegExp('^' + actionNameCriteria + '$', 'i')
    }

    let fn = (msg) => {
      if (msg.type === 'action' && msg.body.actions && msg.body.callback_id === callbackId) {
        for (let i = 0; i < msg.body.actions.length; i++) {
          let action = msg.body.actions[i]
          if (actionNameCriteria.test(action.name)) {
            callback(msg, action.value)
            return true
          }
        }
      }
    }

    return this.match(fn)
  }

  /**
   * Register a new slash command handler
   *
   * @param {string} command - the slash command (e.g. "/doit")
   * @param {(string|RegExp)=} criteria - matching criteria for slash command name (e.g "/^create.*$/")
   * @param {function} callback - (msg) => {}
   * @param {message} callback.msg - instance of Message
   * @example `msg` object:
   *
   *     {
   *        "type":"command",
   *        "body":{
   *           "token":"xxxxxxxxxxxxxxxxxxx",
   *           "team_id":"TXXXXXXXX",
   *           "team_domain":"teamxxxxxxx",
   *           "channel_id":"Dxxxxxxxx",
   *           "channel_name":"directmessage",
   *           "user_id":"Uxxxxxxxx",
   *           "user_name":"xxxx.xxxxxxxx",
   *           "command":"/doit",
   *           "text":"whatever was typed after command",
   *           "response_url":"https://hooks.slack.com/commands/TXXXXXXXX/111111111111111111111111111"
   *        },
   *        "resource":{
   *           "app_token":"xoxp-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX",
   *           "app_user_id":"UXXXXXXXX",
   *           "bot_token":"xoxb-XXXXXXXXXX-XXXXXXXXXXXXXXXXXXXX",
   *           "bot_user_id":"UXXXXXXXX"
   *        },
   *        "meta":{
   *           "user_id":"UXXXXXXXX",
   *           "channel_id":"DXXXXXXXX",
   *           "team_id":"TXXXXXXXX"
   *        },
   *     }
   */

  command (command, criteria, callback) {
    if (typeof criteria === 'function') {
      callback = criteria
      criteria = /.*/
    }
    if (typeof criteria === 'string') {
      criteria = new RegExp(criteria, 'i')
    }

    let fn = (msg) => {
      if (msg.type === 'command' && msg.body.command === command && criteria.test(msg.body.text)) {
        callback(msg)
        return true
      }
    }

    return this.match(fn)
  }
}
