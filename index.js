const slack = require('slack')
const conversationStore = require('./lib/conversation_store')
const Receiver = require('./lib/receiver')

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
   */

  constructor(opts) {
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

    // call `handle` for each new request
    this.receiver.on('message', this._handle.bind(this))
    this.use(this.ignoreBotsMiddleware())
    this.use(this.preprocessConversationMiddleware())
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
          msg.attachOverrideRoute(val.nextFn, val.data)
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
      if (msg.meta.bot_id || msg.meta.user_id === msg.meta.bot_user_id) {
        return
      }
      next()
    }
  }

  /**
   * Register a new middleware
   *
   * Middleware is processed in the order registered.
   * `fn` : (msg, next) => { }
   */

  use(fn) {
    this._middleware.push(fn)
  }

  /**
   * Handle new events (slack events, commands, actions, webhooks, etc.)
   *
   * @api private
   */

  _handle(msg) {
    var self = this
    msg.attachSlackApp(self)
    var idx = 0

    var next = () => {
      var current = idx++
      if (self._middleware[current]) {
        self._middleware[current](msg, next)
        return
      }

      // is there a conversation override?
      if (msg.override) {
        self.convoStore.del(msg.conversation_id)
        msg.override(msg)
        return
      }

      // consider the matchers
      for (var i=0; i < self._matchers.length; i++) {
        // if match is a regex, text the regex against the text of a message (if it is a message)
        var matcher = self._matchers[i]

        if (matcher.type === 'hear' && msg.type === 'event' && msg.body.event.type === 'message') {
          var text = msg.body.event && msg.body.event.text
          if (matcher.match.test(text)) {
            return matcher.handler(msg)
          }
        }

        if (matcher.type === 'event' && msg.type === 'event' && matcher.match.test(msg.body.event.type)) {
          return matcher.handler(msg)
        }

        if (matcher.type === 'action' && msg.type === 'action' && msg.body.actions && msg.body.callback_id === matcher.callback_id) {
          for (var i=0; i < msg.body.actions.length; i++) {
            var action = msg.body.actions[i]
            if (matcher.match.test(action.name)) {
              return matcher.handler(msg, action.value)
            }
          }
        }

        if (matcher.type === 'command' && msg.type === 'command' && msg.body.command === matcher.command && matcher.match.test(msg.body.text)) {
          return matcher.handler(msg)
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
   * Register a new function route
   *
   * Parameters
   * - `fnKey` string - unique key to refer to function
   * - `fn`  function - `(msg) => {}`
   */

  route(fnKey, fn) {
    this._registry[fnKey] = fn
  }

  getRoute(fnKey) {
    return this._registry[fnKey]
  }

  /**
   * Register a new message handler function for the criteria
   *
   * Parameters:
   * - `criteria` string or RegExp - message is string or match RegExp
   * - `fn` function - `(msg) => {}`
   */

  hear(criteria, fn) {
    if (typeof criteria === 'string') {
      criteria = new RegExp('^' + criteria + '\s*$', 'i')
    }
    this._matchers.push({ type: 'hear', match: criteria, handler: fn })
  }

  /**
   * Register a new event handler for an actionName
   *
   * Parameters:
   * - `typeCriteria` string or RegExp - the type of event
   * - `fn` function - `(msg) => {}`
   */

  event(typeCriteria, fn) {
    if (typeof typeCriteria === 'string') {
      typeCriteria = new RegExp('^' + typeCriteria + '$', 'i')
    }
    this._matchers.push({ type: 'event', match: typeCriteria, handler: fn })
  }

  /**
   * Register a new action handler for an actionNameCriteria
   *
   * Parameters:
   * - `callback_id` string
   * - `actionNameCriteria` string or RegExp - the name of the action [optional]
   * - `fn` function - `(msg) => {}`
   */

  action(callback_id, actionNameCriteria, fn) {
    if (typeof actionNameCriteria === 'function') {
      fn = actionNameCriteria
      actionNameCriteria = /.*/
    }

    if (typeof actionNameCriteria === 'string') {
      actionNameCriteria = new RegExp('^' + actionNameCriteria + '$', 'i')
    }

    this._matchers.push({
      type: 'action',
      callback_id: callback_id,
      match: actionNameCriteria,
      handler: fn
    })
  }

  /**
   * Register a new slash command handler
   *
   * Parameters:
   * - `command` string - the slash command (e.g. "/doit")
   * - `criteria` string or RegExp (e.g "/^create.*$/") [optional]
   * - `fn` function - `(msg) => {}`
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
   */

  command(command, criteria, fn) {
    if (typeof criteria === 'function') {
      fn = criteria
      criteria = /.*/
    }
    if (typeof criteria === 'string') {
      criteria = new RegExp(criteria, 'i')
    }
    this._matchers.push({ type: 'command', command: command, match: criteria, handler: fn })
  }

}
