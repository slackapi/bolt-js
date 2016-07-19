const slack = require('slack')
const conversationStore = require('./lib/conversation_store')
const Receiver = require('./lib/receiver')
const Conversation = require('./lib/conversation')

/**
 * SlackApp module
 */
module.exports = class SlackApp {

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
   * - `client`      `slack` client, defaults to `require('slack')`
   */

  constructor(opts) {
    opts = opts || {}
    this.middleware = []
    this.matchers = []
    this.registry = {}

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
    this.client = opts.client || slack
    this.receiver = new Receiver(opts)

    // call `handle` for each new request
    this.receiver.on('request', this.handle.bind(this))
    this.use(this.ignoreMeMiddleware())
    this.use(this.preprocessConversationMiddleware())
  }

  /**
   * Middleware that gets an existing conversation from the conversation store
   * or initialize a new one.
   *
   * @api private
   */

  preprocessConversationMiddleware () {
    return (req, next) => {
      var convoId = [req.meta.team_id, req.meta.channel_id].join(':')
      // req.convoId = convoId

      this.convoStore.get(convoId, (err, val) => {
        if (err) return this.onError(err)
        if (val) {
          req.convo = new Conversation(this, convoId, val.data, val.nextFn)
        } else {
          req.convo = new Conversation(this, convoId)
        }
        next()
      })
    }
  }

  /**
   * Middleware that ignores messages from the bot user
   * or initialize a new one.
   *
   * @api private
   */

  ignoreMeMiddleware () {
    return (req, next) => {
      var isMessage = req.type === 'event' && req.body.event.type === 'message'
      if (isMessage && req.meta.user_id === this.bot_user_id) {
        return
      }
      next()
    }
  }

  /**
   * Register a new middleware
   *
   * Middleware is processed in the order registered.
   * `fn` : (req, next) => { }
   */

  use(fn) {
    this.middleware.push(fn)
  }

  /**
   * Handle new events (slack events, commands, actions, webhooks, etc.)
   *
   * @api private
   */

  handle(req) {
    var self = this
    var idx = 0

    var next = () => {
      var current = idx++
      if (self.middleware[current]) {
        self.middleware[current](req, next)
      } else if (req.convo && req.convo.nextFn) {
        console.log("req.convo.nextFn: ", req.convo.nextFn)
        self.convoStore.del(req.convo.id)
        var fn = self.registry[req.convo.nextFn]
        if (fn) {
          return fn(req)
        }
      } else {
        // handle matchers
        for (var i=0; i < self.matchers.length; i++) {
          // if match is a regex, text the regex against the text of a message (if it is a message)
          var matcher = self.matchers[i]

          if (matcher.type === 'hear' && matcher.match instanceof RegExp) {
            var text = req.body.event && req.body.event.text
            if (matcher.match.test(text)) {
              return matcher.handler (req)
            }
          }

          if (matcher.type === 'action' && req.body.actions) {
            for (var i=0; i < req.body.actions.length; i++) {
              var action = req.body.actions[i]
              if (action.name === matcher.name) {
                return matcher.handler (req, action.value)
              }
            }
          }
        }
      }
    }

    next()
  }

  /**
   * Attach HTTP routes to an Express app
   *
   * Routes are:
   * - POST `/slack-event`
   * - POST `/slack-command`
   * - POST `/slack-interactive`
   */

  attachToExpress(app) {
    return this.receiver.attachToExpress(app)
  }

  /**
   * Register a new function handler, used with Conversations
   *
   * Parameters
   * - `key` string - unique key to refer to function
   * - `fn`  function - `(req) => {}`
   */

  register(key, fn) {
    this.registry[key] = fn
  }

  /**
   * Register a new handler function for the criteria
   */

  hear(criteria, fn) {
    if (typeof criteria === 'string') {
      criteria = new RegExp(criteria, 'i')
    }
    this.matchers.push({ type: 'hear', match: criteria, handler: fn })
  }

  /**
   * Register a new action handler for an actionName
   */

  action(actionName, fn) {
    this.matchers.push({ type: 'action', name: actionName, handler: fn })
  }

}
