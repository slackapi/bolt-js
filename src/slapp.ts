'use strict'

const EventEmitter = require('events')
const { WebClient } = require('@slack/client')
const conversationStore = require('./conversation_store')
import ExpressReceiver, { Receiver } from './receiver';
import defaultLogger, { Logger } from './logger';
const pathToRegexp = require('path-to-regexp')
const HOUR = 60 * 60

/**
 * A Slack App
 * @class Slapp
 * @api private
 */
class Slapp extends EventEmitter {

  /* Receiver */
  private receiver: Receiver;

  /* Should enable logging */
  private log: boolean;

  /* Logger instance */
  private logger: Logger;

  /* Ignore any messages from your app */
  private ignoreSelf: boolean;

  /* Ignore any messages from a bot user */
  private ignoreBots: boolean;

  /* Enable colors for logging */
  private colors: boolean;

  constructor({
    signingSecret = undefined,
    receiver = undefined,
    convoStore = undefined,
    context = undefined,
    logger = defaultLogger,
    log = false,
    colors = false,
    ignoreSelf = false,
    ignoreBots = false
  }: SlappOptions = {}) {
    super();

    //if (!opts.context) {
      // TODO: Add a link to the github readme section talking about the context function
      //throw new Error('No context function provided. Please provide a context function to enrich Slack requests with necessary data.')
    //}

    this._middleware = [];
    this._matchers = [];
    this._registry = {};

    this.signingSecret = signingSecret;

    this.log = log;
    this.colors = colors;
    this.logger = logger;

    this.ignoreSelf = ignoreSelf;
    this.ignoreBots = ignoreBots;

    // If convo_store is a string, initialize that type of conversation store
    // If it's not a sting and it is defined, assume it is an implementation of
    // a conversation store
    if (!convoStore || typeof convoStore === 'string') {
      this.convoStore = conversationStore({ type: convoStore });
    } else {
      this.convoStore = convoStore;
    }

    this.client = new WebClient();
    this.receiver = new ExpressReceiver(signingSecret);
  }

  /**
   * Initialize app w/ logger, default middleware and receiver listener
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * @api private
   */
  init () {
    // attach default logging if enabled
    // TODO: fix logger 
    // if (this.log) {
    //   this.logger(this, {
    //     colors: this.colors
    //   })
    // }

    // call `handle` for each new request
    this.receiver
      .on('message', this._handle.bind(this))
      .on('error', this.emit.bind(this, 'error'))

    if (this.ignoreBots) {
      this.use(this.ignoreBotsMiddleware())
    }
    if (this.ignoreSelf) {
      this.use(this.ignoreSelfMiddleware())
    }
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
          return this.emit('error', err)
        }

        if (val) {
          msg.attachOverrideRoute(val.fnKey, val.state)
        }

        next()
      })
    }
  }

  /**
   * Middleware that ignores messages from this bot user (self) when we can tell. Requires the
   * meta context to be populated with `app_bot_id`.
   *
   * @api private
   */

  ignoreSelfMiddleware () {
    return (msg, next) => {
      if (msg.isBot() && msg.isMessage() && msg.body.event.subtype === 'bot_message') {
        let bothFalsy = !msg.meta.app_bot_id && !msg.meta.bot_id
        let bothEqual = msg.meta.app_bot_id === msg.meta.bot_id
        if (!bothFalsy && bothEqual) {
          return
        }
      }
      next()
    }
  }

  /**
   * Middleware that ignores messages from any bot user
   *
   * @api private
   */

  ignoreBotsMiddleware () {
    return (msg, next) => {
      if (msg.isBot() && msg.isMessage() && msg.body.event.subtype === 'bot_message') {
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

    let err = msg.verifyProps()
    if (err) {
      self.emit('error', err)
    }

    this.emit('info', msg)
    msg.attachSlapp(self)
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
            self.emit('error', err)
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

      // no matchers
      msg.clearResponse({ close: true })

      done(null, false)
    }

    next()

    return this
  }

  /**
   * Attach HTTP routes to an Express app
   *
   * Routes are:
   * - POST `/slack/event`
   * - POST `/slack/command`
   * - POST `/slack/action`
   *
   * ##### Parameters
   * - `app` instance of Express app or Express.Router
   * - `opts.event` `boolean|string` - event route (defaults to `/slack/event`) [optional]
   * - `opts.command` `boolean|string` - command route (defaults to `/slack/command`) [optional]
   * - `opts.action` `boolean|string` - action route (defaults to `/slack/action`) [optional]
   *
   *
   * ##### Returns
   * - `app` reference to Express app or Express.Router passed in
   *
   *
   * Examples:
   *
   *     // would attach all routes w/ default paths
   *     slapp.attachToExpress(app)
   *
   *     // with options
   *     slapp.attachToExpress(app, {
   *       event: true, // would register event route with default of /slack/event
   *       command: false, // would not register a route for commands
   *       action: '/slack-action' // custom route for actions
   *     })
   *
   *     // would only attach a route for events w/ default path
   *     slapp.attachToExpress(app, {
   *       event: true
   *     })
   *
   * @param {Object} app - instance of Express app
   * @param {Object} opts - options for attaching routes
   */


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
   * - `callback` function - `(msg, text, [match1], [match2]...) => {}`
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * Example with regex matchers:
   *
   *     slapp.message('^play (song|artist) <([^>]+)>', (msg, text, type, toplay) => {
   *       // text = 'play artist spotify:track:1yJiE307EBIzOB9kqH1deb'
   *       // type = 'artist'
   *       // toplay = 'spotify:track:1yJiE307EBIzOB9kqH1deb'
   *     }
   *
   * Example without matchers:
   *
   *     slapp.message('play', (msg, text) => {
   *       // text = 'play'
   *     }
   *
   * Example `msg.body`:
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
      if (msg.isBaseMessage()) {
        let text = msg.stripDirectMention()
        let match = text.match(criteria)
        if (match && (typeFilter.length === 0 || msg.isAnyOf(typeFilter))) {
          callback.apply(null, [msg].concat(match))
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
      criteria = new RegExp(`^${criteria}$`, 'i')
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
   * Register a new handler for button or menu actions. The actionValueCriteria
   * (optional) for menu options will successfully match if any one of the values
   * match the criteria.
   *
   * The `callbackId` can optionally accept a URL path like pattern matcher that can be
   * used to match as well as extract values. For example if `callbackId` is `/myaction/:type/:id`,
   * it _will_ match on `/myaction/a-great-action/abcd1234`. And the resulting `Message` object will
   * include a `meta.params` object that contains the extracted variables. For example,
   * `msg.meta.params.type` ==> `a-great-action` and `msg.meta.params.id` ==> `abcd1234`. This allows
   * you to match on dynamic callbackIds while passing data.
   *
   * Note, `callback_id` values must be properly encoded. We suggest you use `encodeURIComponent` and `decodeURIComponent`.
   *
   * The underlying module used for matching
   * is [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) where there are a lot of examples.
   *
   *
   * ##### Parameters
   * - `callbackIdPath` string - may be a simple string or a URL path matcher
   * - `actionNameCriteria` string or RegExp - the name of the action [optional]
   * - `actionValueCriteria` string or RegExp - the value of the action [optional]
   * - `callback` function - `(msg, value) => {}` - value may be a string or array of strings
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * Example:
   *
   *     // match name and value
   *     slapp.action('dinner_callback', 'drink', 'beer', (msg, val) => {}
   *     // match name and value either beer or wine
   *     slapp.action('dinner_callback', 'drink', '(beer|wine)', (msg, val) => {}
   *     // match name drink, any value
   *     slapp.action('dinner_callback', 'drink', (msg, val) => {}
   *     // match dinner_callback, any name or value
   *     slapp.action('dinner_callback', 'drink', (msg, val) => {}
   *     // match with regex
   *     slapp.action('dinner_callback', /^drink$/, /^b[e]{2}r$/, (msg, val) => {}
   *     // callback_id matcher
   *     slapp.action('/dinner_callback/:drink', (msg, val) => {}
   *
   * Example button action `msg.body` object:
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
   *
   * Example menu action `msg.body` object:
   *
   *     {
   *       "actions": [
   *         {
   *           "name": "winners_list",
   *           "selected_options": [
   *             {
   *               "value": "U061F1ZUR"
   *             }
   *           ]
   *         }
   *       ],
   *         "callback_id": "select_simple_1234",
   *           "team": {
   *         "id": "T012AB0A1",
   *           "domain": "pocket-calculator"
   *       },
   *       "channel": {
   *         "id": "C012AB3CD",
   *           "name": "general"
   *       },
   *       "user": {
   *         "id": "U012A1BCD",
   *           "name": "musik"
   *       },
   *       "action_ts": "1481579588.685999",
   *         "message_ts": "1481579582.000003",
   *           "attachment_id": "1",
   *             "token": "verification_token_string",
   *               "original_message": {
   *         "text": "It's time to nominate the channel of the week",
   *           "bot_id": "B08BCU62D",
   *             "attachments": [
   *               {
   *                 "callback_id": "select_simple_1234",
   *                 "fallback": "Upgrade your Slack client to use messages like these.",
   *                 "id": 1,
   *                 "color": "3AA3E3",
   *                 "actions": [
   *                   {
   *                     "id": "1",
   *                     "name": "channels_list",
   *                     "text": "Which channel changed your life this week?",
   *                     "type": "select",
   *                     "data_source": "channels"
   *                   }
   *                 ]
   *               }
   *             ],
   *               "type": "message",
   *                 "subtype": "bot_message",
   *                   "ts": "1481579582.000003"
   *       },
   *       "response_url": "https://hooks.slack.com/actions/T012AB0A1/1234567890/JpmK0yzoZ5eRiqfeduTBYXWQ"
   *     }
   *
   * @param {string} callbackId
   * @param {(string|RegExp)} actionNameCriteria
   * @param {(string|RegExp)} actionValueCriteria
   * @param {function} callback
   */

  action (callbackIdPath, actionNameCriteria, actionValueCriteria, callback) {
    if (typeof actionValueCriteria === 'function') {
      callback = actionValueCriteria
      actionValueCriteria = /.*/
    }

    if (typeof actionNameCriteria === 'function') {
      callback = actionNameCriteria
      actionNameCriteria = /.*/
      actionValueCriteria = /.*/
    }

    if (typeof actionNameCriteria === 'string') {
      actionNameCriteria = new RegExp(`^${actionNameCriteria}$`, 'i')
    }

    if (typeof actionValueCriteria === 'string') {
      actionValueCriteria = new RegExp(`^${actionValueCriteria}$`, 'i')
    }

    var keys = []
    var callbackIdCriteria = pathToRegexp(callbackIdPath, keys)

    let fn = (msg) => {
      if (msg.type !== 'action' || !msg.body.actions) return
      let callbackIdMatch = callbackIdCriteria.exec(msg.body.callback_id)
      if (!callbackIdMatch) return

      let params = {}
      keys.forEach((key, i) => {
        params[key.name] = callbackIdMatch[i + 1]
      })
      msg.meta.params = params

      // Don't know how to handle multiple actions in the area. As far as this writing, this isn't ever
      // expected to happen. Best way to handle this uncertainty is to loop until we find a match and then stop
      for (let i = 0; i < msg.body.actions.length; i++) {
        let action = msg.body.actions[i]
        if (actionNameCriteria.test(action.name)) {
          // test for menu options. There could be multiple options returned so attempt to match
          // on any of them and if any one matches, we'll consider this a match.
          if (Array.isArray(action.selected_options)) {
            if (action.selected_options.find(option => actionValueCriteria.test(option.value))) {
              callback(msg, action.selected_options.map(it => it.value))
              return true
            }
          }
          // test for message actions
          if (actionValueCriteria.test(action.value)) {
            callback(msg, action.value)
            return true
          }
        }
      }
    }

    return this.match(fn)
  }

  /**
   * Register a new handler for a [message action](https://api.slack.com/actions).
   *
   * The `callbackId` should match the "Callback ID" registered in the message action.
   *
   *
   * ##### Parameters
   * - `callbackId` string
   * - `callback` function - `(msg, message) => {}` - message
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * Example:
   *
   *     // match on callback_id
   *     slapp.messageAction('launch_message_action', (msg, message) => {}
   *
   *
   * Example message action `msg.body` object:
   *
   *     {
   *       "token": "Nj2rfC2hU8mAfgaJLemZgO7H",
   *       "callback_id": "chirp_message",
   *       "type": "message_action",
   *       "trigger_id": "13345224609.8534564800.6f8ab1f53e13d0cd15f96106292d5536",
   *       "response_url": "https://hooks.slack.com/app-actions/T0MJR11A4/21974584944/yk1S9ndf35Q1flupVG5JbpM6",
   *       "team": {
   *         "id": "T0MJRM1A7",
   *         "domain": "pandamonium",
   *       },
   *       "channel": {
   *         "id": "D0LFFBKLZ",
   *         "name": "cats"
   *       },
   *       "user": {
   *         "id": "U0D15K92L",
   *         "name": "dr_maomao"
   *       },
   *       "message": {
   *         "type": "message",
   *         "user": "U0MJRG1AL",
   *         "ts": "1516229207.000133",
   *         "text": "World's smallest big cat! <https://youtube.com/watch?v=W86cTIoMv2U>"
   *       }
   *     }
   *
   *
   * @param {string} callbackId
   * @param {function} callback
   */

  messageAction (callbackId, callback) {
    let fn = (msg) => {
      if (msg.type !== 'action' || msg.body.type !== 'message_action') return
      if (msg.body.callback_id !== callbackId) return
      callback(msg, msg.body.message)
      return true
    }

    return this.match(fn)
  }

  /**
   * Register a new interactive message options handler
   *
   * `options` accepts a `callbackIdPath` like `action`. See `action` for details.
   *
   * ##### Parameters
   * - `callbackIdPath` string - may be a simple string or a URL path matcher
   * - `actionNameCriteria` string or RegExp - the name of the action [optional]
   * - `actionValueCriteria` string or RegExp - the value of the action [optional]
   * - `callback` function - `(msg, value) => {}` - value is the current value of the option (e.g. partially typed)
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * Example matching callback only
   *
   *     slapp.options('my_callback', (msg, value) => {}
   *
   *
   * Example with name matcher
   *
   *     slapp.options('my_callback', 'my_name', (msg, value) => {}
   *
   *
   * Example with RegExp matcher criteria:
   *
   *     slapp.options('my_callback', /my_n.+/, (msg, value) => {}
   *
   * Example with callback_id path criteria:
   *
   *     slapp.options('/my_callback/:id', (msg, value) => {}
   *
   *
   *
   * Example `msg.body` object:
   *
   *     {
   *         "name": "musik",
   *         "value": "",
   *         "callback_id": "select_remote_1234",
   *         "team": {
   *             "id": "T012AB0A1",
   *             "domain": "pocket-calculator"
   *         },
   *         "channel": {
   *             "id": "C012AB3CD",
   *             "name": "general"
   *         },
   *         "user": {
   *             "id": "U012A1BCD",
   *             "name": "musik"
   *         },
   *         "action_ts": "1481670445.010908",
   *         "message_ts": "1481670439.000007",
   *         "attachment_id": "1",
   *         "token": "verification_token_string"
   *     }
   **
   * @param {string} callbackId
   * @param {(string|RegExp)} actionNameCriteria
   * @param {(string|RegExp)} actionValueCriteria
   * @param {function} callback
   */

  options (callbackIdPath, actionNameCriteria, callback) {
    if (typeof actionNameCriteria === 'function') {
      callback = actionNameCriteria
      actionNameCriteria = /.*/
    }

    if (typeof actionNameCriteria === 'string') {
      actionNameCriteria = new RegExp(`^${actionNameCriteria}$`, 'i')
    }

    var keys = []
    var callbackIdCriteria = pathToRegexp(callbackIdPath, keys)

    let fn = (msg) => {
      if (msg.type !== 'options') return false
      let callbackIdMatch = callbackIdCriteria.exec(msg.body.callback_id)
      if (!callbackIdMatch) return

      let params = {}
      keys.forEach((key, i) => {
        params[key.name] = callbackIdMatch[i + 1]
      })
      msg.meta.params = params

      if (actionNameCriteria.test(msg.body.name)) {
        callback(msg, msg.body.value)
        return true
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
   * Example without parameters:
   *
   *     // "/acommand"
   *     slapp.command('acommand', (msg) => {
   *     }
   *
   *
   * Example with RegExp matcher criteria:
   *
   *     // "/acommand create flipper"
   *     slapp.command('acommand', 'create (.*)'(msg, text, name) => {
   *       // text = 'create flipper'
   *       // name = 'flipper'
   *     }
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
    if (typeof command === 'string') {
      command = new RegExp(`^${command}$`, 'i')
    }

    let fn = (msg) => {
      if (msg.type === 'command' && msg.body.command && msg.body.command.match(command)) {
        let text = msg.body.text || ''
        let match = text.match(criteria)
        if (match) {
          callback.apply(null, [msg].concat(match))
          return true
        }
      }
    }

    return this.match(fn)
  }

    /**
   * Register a dialog submission handler for the given callback_id
   *
   * ##### Parameters
   * - `callbackId` string - the callback_id of the form
   * - `callback` function - `(msg, submission) => {}`
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * Example;
   *
   *     // "/acommand"
   *     slapp.command('my_callback_id', (msg, submission) => {
   *       submission.prop_name_1
   *     }
   *
   *
   * Example `msg` object:
   *
   *     {
   *        "type":"action",
   *        "body":{
   *          "type": "dialog_submission",
   *          "submission": {
   *            "answer": "two",
   *            "feedback": "test"
   *          },
   *          "callback_id": "xyz",
   *          "team": {
   *            "id": "T1PR9DEFS",
   *            "domain": "aslackdomain"
   *          },
   *          "user": {
   *            "id": "U1ABCDEF",
   *            "name": "mikebrevoort"
   *          },
   *          "channel": {
   *            "id": "C1PR520RRR",
   *            "name": "random"
   *          },
   *          "action_ts": "1503445940.478855"
   *        },
   *     }
   * @param {string} callbackId
   * @param {function} callback
   */

  dialog (callbackIdPath, callback) {
    var keys = []
    var callbackIdCriteria = pathToRegexp(callbackIdPath, keys)

    let fn = (msg) => {
      if (msg.type !== 'action' || msg.body.type !== 'dialog_submission') return
      let callbackIdMatch = callbackIdCriteria.exec(msg.body.callback_id)
      if (!callbackIdMatch) return

      let params = {}
      keys.forEach((key, i) => {
        params[key.name] = callbackIdMatch[i + 1]
      })
      msg.meta.params = params

      callback(msg, msg.body.submission)
      return true
    }

    return this.match(fn)
  }
}

/*
 * Exported types
 */
export interface SlappOptions {
  signingSecret?: string;
  convoStore?: any;
  context?: any;
  receiver?: Receiver;
  logger?: Logger;
  log?: boolean;
  colors?: boolean;
  ignoreSelf?: boolean;
  ignoreBots?: boolean;
}

export default Slapp;

