'use strict'

const slack = require('slack')
const conversationStore = require('./conversation_store')
const Receiver = require('./receiver')

/**
 * A Slack App
 * @class SlackApp
 * @api private
 */
class SlackApp {

  /**
   * Construct a SlackApp, accepts an options object
   *
   * ##### Parameters
   * - `opts.app_token`   Slack App token override
   * - `opts.app_user_id` Slack App User ID (who installed the app)
   * - `opts.bot_token`   Slack App Bot token
   * - `opts.bot_user_id` Slack App Bot ID
   * - `opts.convo_store` Implementation of ConversationStore, defaults to memory
   * - `opts.error`       Error handler function `(error) => {}`
   *
   * @api private
   * @constructor
   * @param {Object} opts
   * @returns {Object} SlackApp
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
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * @api private
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
   * @api private
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
   * @api private
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
   * Register a new middleware, processed in the order registered.
   *
   * ##### Parameters
   * - `fn`: middleware function `(msg, next) => { }`
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * @param {function} fn
   * @api public
   */

  use (fn) {
    this._middleware.push(fn)

    return this
  }

  /**
   * Handle new events (slack events, commands, actions, webhooks, etc.)
   *
   * ##### Parameters
   * - `msg` `Message`
   * - `done` `function(err, bool)` Callback called once complete, called with error and boolean indicating message was handled [optional]
   *
   * @param {Message} msg
   * @param {function} done
   * @api private
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
   * Attach HTTP routes to an Express app
   *
   * Routes are:
   * - POST `/slackapp/event`
   * - POST `/slackapp/command`
   * - POST `/slackapp/action`
   *
   * ##### Parameters
   * - `app` instance of Express app
   *
   *
   * ##### Returns
   * - `app` reference to Express app passed in
   *
   * @param {Object} app - instance of Express app
   */

  attachToExpress (app) {
    return this.receiver.attachToExpress(app)
  }

  /**
   * Register a new function route
   *
   * ##### Parameters
   * - `fnKey` unique key to refer to function
   * - `fn` `(msg, state) => {}`
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * @param {string} fnKey
   * @param {function} fn
   */

  route (fnKey, fn) {
    this._registry[fnKey] = fn

    return this
  }

  /**
   * Return a registered route
   *
   * ##### Parameters
   * - `fnKey` string - unique key to refer to function
   *
   *
   * ##### Returns
   * - `(msg, state) => {}`
   *
   * @param {string} fnKey
   */

  getRoute (fnKey) {
    return this._registry[fnKey]
  }

  /**
   * Register a custom Match function (fn)
   *
   * ##### Returns `true` if there is a match AND you handled the msg.
   * Return `false` if there is not a match and you pass on the message.
   *
   * All of the higher level matching convenience functions
   * generate a match function and call `match` to register it.
   *
   * Only one matcher can return true, and they are executed in the order they are
   * defined. Match functions should return as fast as possible because it's important
   * that they are efficient. However you may do asyncronous tasks within to
   * your hearts content.
   *
   * ##### Parameters
   * - `fn` function - match function `(msg) => { return bool }`
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * @param {function} fn
   */

  match (fn) {
    this._matchers.push(fn)

    return this
  }

  /**
   * Register a new message handler function for the criteria
   *
   * ##### Parameters
   * - `criteria` text that message contains or regex (e.g. "^hi")
   * - `typeFilter` [optional] Array for multiple values or string for one value. Valid values are `direct_message`, `direct_mention`, `mention`, `ambient`
   * - `callback` function - `(msg) => {}`
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   *
   * Example `msg` object:
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
   *
   * @param {(string)} criteria
   * @param {(string|Array)} typeFilter
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
    this.match(fn)
    return this
  }

  /**
   * Register a new event handler for an actionName
   *
   * ##### Parameters
   * - `criteria` the type of event
   * - `callback` `(msg) => {}`
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   *
   * Example `msg` object:
   *
   *     {
   *        "token":"dxxxxxxxxxxxxxxxxxxxx",
   *        "team_id":"TXXXXXXXX",
   *        "api_app_id":"AXXXXXXXX",
   *        "event":{
   *           "type":"reaction_added",
   *           "user":"UXXXXXXXX",
   *           "item":{
   *              "type":"message",
   *              "channel":"DXXXXXXXX",
   *              "ts":"1469130181.000096"
   *           },
   *           "reaction":"grinning"
   *        },
   *        "event_ts":"1469131201.822817",
   *        "type":"event_callback",
   *        "authed_users":[
   *           "UXXXXXXXX"
   *        ]
   *     }
   *
   * @param {(string|RegExp)} criteria
   * @param {function} callback
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
   * ##### Parameters
   * - `callbackId` string
   * - `actionNameCriteria` string or RegExp - the name of the action [optional]
   * - `callback` function - `(msg) => {}`
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   *
   * Example `msg` object:
   *
   *     {
   *        "actions":[
   *           {
   *              "name":"answer",
   *              "value":":wine_glass:"
   *           }
   *        ],
   *        "callback_id":"in_or_out_callback",
   *        "team":{
   *           "id":"TXXXXXXXX",
   *           "domain":"companydomain"
   *        },
   *        "channel":{
   *           "id":"DXXXXXXXX",
   *           "name":"directmessage"
   *        },
   *        "user":{
   *           "id":"UXXXXXXXX",
   *           "name":"mike.brevoort"
   *        },
   *        "action_ts":"1469129995.067370",
   *        "message_ts":"1469129988.000084",
   *        "attachment_id":"1",
   *        "token":"dxxxxxxxxxxxxxxxxxxxx",
   *        "original_message":{
   *           "text":"What?",
   *           "username":"In or Out",
   *           "bot_id":"BXXXXXXXX",
   *           "attachments":[
   *              {
   *                 "callback_id":"in_or_out_callback",
   *                 "fallback":"Pick one",
   *                 "id":1,
   *                 "actions":[
   *                    {
   *                       "id":"1",
   *                       "name":"answer",
   *                       "text":":beer:",
   *                       "type":"button",
   *                       "value":":beer:",
   *                       "style":""
   *                    },
   *                    {
   *                       "id":"2",
   *                       "name":"answer",
   *                       "text":":beers:",
   *                       "type":"button",
   *                       "value":":wine:",
   *                       "style":""
   *                    },
   *                 ]
   *              },
   *              {
   *                 "text":":beers: • mike.brevoort",
   *                 "id":2,
   *                 "fallback":"who picked beers"
   *              }
   *           ],
   *           "type":"message",
   *           "subtype":"bot_message",
   *           "ts":"1469129988.000084"
   *        },
   *        "response_url":"https://hooks.slack.com/actions/TXXXXXXXX/111111111111/txxxxxxxxxxxxxxxxxxxx"
   *     }
   *
   * @param {string} callbackId
   * @param {(string|RegExp)} actionNameCriteria
   * @param {function} callback
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
   * ##### Parameters
   * - `command` string - the slash command (e.g. "/doit")
   * - `criteria` string or RegExp (e.g "/^create.+$/") [optional]
   * - `callback` function - `(msg) => {}`
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   *
   * Example `msg` object:
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
   * @param {string} command
   * @param {(string|RegExp)} criteria
   * @param {function} callback
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

module.exports = SlackApp
