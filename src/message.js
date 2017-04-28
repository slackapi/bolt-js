'use strict'
const request = require('request')
const slack = require('slack')
const Queue = require('js-queue')
const RATE_LIMIT = 'You are sending too many requests. Please relax.'

/**
 * A Slack event message (command, action, event, etc.)
 * @class Message
 * @api private
 */
class Message {

  /**
   * Construct a new Message
   *
   * ##### Parameters
   * - `type` the type of message (event, command, action, etc.)
   *
   * @param {string} type
   * @param {Object} body
   * @param {Object} meta
   * @constructor
   */
  constructor (type, body, meta) {
    this.type = type
    this.body = body || {}
    this.meta = meta || {}
    this.makeThreaded = null
    this.conversation_id = [
      this.meta.team_id,
      this.meta.channel_id || 'nochannel',
      this.meta.user_id || this.meta.bot_id || 'nouser'
    ].join('::')

    this._slapp = null
    this._queue = null

    // allow clearTimeout to be stubbed
    this.clearTimeout = clearTimeout
  }

  /**
   * Attach a Slapp reference
   *
   * ##### Parameters
   * - `slapp` instance of Slapp
   *
   * @param {Slapp} slapp
   * @api private
   */
  attachSlapp (slapp) {
    this._slapp = slapp
  }

  /**
   * Attach override handler in a conversation
   *
   * ##### Parameters
   * - `fnKey` function key
   * - `state` saved state to be passed onto router handler
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * @param {string} fnKey
   * @param {Object} state
   * @api private
   */
  attachOverrideRoute (fnKey, state) {
    let fn = this._slapp.getRoute(fnKey)

    // TODO: should we bubble up if a function doesn't exist?
    // It may be that it did exist but a new version was deployed that removed it.
    // What do we do then?
    if (fn) {
      this.override = (msg) => {
        return fn(msg, state)
      }
    }
    return this
  }

  /**
   * Attach response for cases the support responding directly to a request from Slack.
   * This includes slash commands and message actions. If there is a response attached,
   * `msg.respond` will use the request to respond, otherwise it will use the response_url
   * to respond asynchronously. The `deadline` parameter controls how
   * long to wait before timing out then close the HTTP request and fallback to the
   * `response_url`.
   *
   * ##### Parameters
   * - `response` fhttp response
   * - `deadline` number of milliseconds before timing the response out
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * @param {Object} resp
   * @param {number} deadline
   * @api private
   */
  attachResponse (response, deadline) {
    let self = this
    self._response = response

    self._responseTimeout = setTimeout(() => {
      if (self._response && !self._response.headersSent) {
        let response = self._response
        self._response = undefined
        self._responseTimeout = undefined
        response.send()
      }
    }, deadline)

    return this
  }

  /**
   * Clears the attached response if it exists and returns that response,
   * returns null otherwise. Also clear the timeout.
   *
   * ##### Parameters
   * - `options` `Object` options object. Supports `close`, if true then close response
   *
   * ##### Returns `response` if attached, otherwise null
   *
   * @param {Object} options
   *
   * @api private
   */
  clearResponse (options) {
    let self = this
    options = options || {}
    if (self._responseTimeout) {
      self.clearTimeout(self._responseTimeout)
      self._responseTimeout = undefined
    }
    if (self._response) {
      let response = self._response
      self._response = undefined
      if (options.close) {
        response.send()
      }
      return response
    }
    return null
  }

  /**
   * Register the next function to route to in a conversation.
   *
   * The route should be registered already through `slapp.route`
   *
   * ##### Parameters
   * - `fnKey` `string`
   * - `state` `object` arbitrary data to be passed back to your function [optional]
   * - `secondsToExpire` `number` - number of seconds to wait for the next message in the conversation before giving up. Default 60 minutes [optional]
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * @param {string} fnKey
   * @param {Object} state
   * @param {number} secondsToExpire
   */

  route (fnKey, state, secondsToExpire) {
    if (!state) {
      state = {}
    }

    if (!secondsToExpire && secondsToExpire !== 0) {
      secondsToExpire = this._slapp.defaultExpiration
    }

    let key = this.conversation_id
    let expiration = secondsToExpire === 0
      ? null
      : Date.now() + secondsToExpire * 1000
    this._slapp.convoStore.set(key, { fnKey, state, expiration }, (err) => {
      if (err) {
        this._slapp.emit('error', err)
      }
    })
    return this
  }

  /**
   * Explicity cancel pending `route` registration.
   */

  cancel () {
    this._slapp.convoStore.del(this.conversation_id)
  }

  /**
   * Send a message through [`chat.postmessage`](https://api.slack.com/methods/chat.postMessage).
   *
   * The current channel and inferred tokens are used as defaults. `input` maybe a
   * `string`, `Object` or mixed `Array` of `strings` and `Objects`. If a string,
   * the value will be set to `text` of the `chat.postmessage` object. Otherwise pass
   * a [`chat.postmessage`](https://api.slack.com/methods/chat.postMessage) `Object`.
   * If the current message is part of a thread, the new message will remain
   * in the thread. To control if a message is threaded or not you can use the
   * `msg.thread()` and `msg.unthread()` functions.
   *
   * If `input` is an `Array`, a random value in the array will be selected.
   *
   * ##### Parameters
   * - `input` the payload to send, maybe a string, Object or Array.
   * - `callback` (err, data) => {}
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * @param {(string|Object|Array)} input
   * @param {function} callback
   */

  say (input, callback) {
    var self = this
    if (!callback) callback = () => {}

    input = self._processInput(input)

    let payload = Object.assign({
      token: self.meta.bot_token || self.meta.app_token,
      channel: self.meta.channel_id
    }, input)

    // keep the message threaded unless we've "unthreaded" it
    if (this.isThreaded() && this.makeThreaded !== false) {
      payload.thread_ts = this.body.event.thread_ts
    } else if (this.makeThreaded === true) {
      payload.thread_ts = this.body.event.ts
    }

    self._queueRequest(() => {
      slack.chat.postMessage(payload, (err, data) => {
        if (err) {
          self._slapp.emit('error', err)
        }
        callback(err, data)
        self._queue.next()
      })
    })
    return self
  }

  /**
   * Respond to a Slash command, interactive message action, or interactive message options request.
   *
   * Slash commands and message actions responses should be passed a [`chat.postmessage`](https://api.slack.com/methods/chat.postMessage)
   * payload. If `respond` is called within 3000ms (2500ms actually with a 500ms buffer) of the original request,
   * the original request will be responded to instead or using the `response_url`. This will keep the
   * action button spinner in sync with an awaiting update and is about 25% more responsive when tested.
   *
   * `input` options are the same as [`say`](#messagesay)
   *
   *
   * If a response to an interactive message options request then an array of options should be passed
   * like:
   *
   *      {
   *        "options": [
   *          { "text": "value" },
   *          { "text": "value" }
   *        ]
   *      }
   *
   *
   * ##### Parameters
   * - `responseUrl` string - URL provided by a Slack interactive message action or slash command [optional]
   * - `input` the payload to send, maybe a string, Object or Array.
   * - `callback` (err, data) => {}
   *
   * Example:
   *
   *     // responseUrl implied from body.response_url if this is an action or command
   *     msg.respond('thanks!', (err) => {})
   *
   *     // responseUrl explicitly provided
   *     msg.respond(responseUrl, 'thanks!', (err) => {})
   *
   *     // input provided as object
   *     msg.respond({ text: 'thanks!' }, (err) => {})
   *
   *     // input provided as Array
   *     msg.respond(['thanks!', 'I :heart: u'], (err) => {})
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   * @param {string} [responseUrl]
   * @param {(string|Object|Array)} input
   * @param {function} callback
   */

  respond (responseUrl, input, callback) {
    var self = this
    if (!input || typeof input === 'function') {
      callback = input
      input = responseUrl
      responseUrl = self.body.response_url
    }
    if (!callback) callback = () => {}

    let response = self.clearResponse()

    if (!responseUrl && !response) {
      callback(new Error('no attached request and responseUrl not provided or not included as response_url with this type of Slack request'))
      return self
    }

    if (response) {
      response.send(input)
      callback(null, {})
      return self
    }

    self._queueRequest(() => {
      self._request(responseUrl, self._processInput(input), (err, res, body) => {
        // Normalize error for different error cases
        if (!err && body.error) {
          err = new Error(body.error)
        }
        if (!err && typeof body === 'string' && body.includes(RATE_LIMIT)) {
          err = new Error('rate_limit')
        }

        if (err) {
          self._slapp.emit('error', err)
          callback(err)
          return self._queue.next()
        }

        // success! clean up the response
        delete body.ok
        callback(null, body)
        self._queue.next()
      })
    })

    return self
  }

  /**
   * Ensures all subsequent messages created are under a thread of the current message
   *
   * Example:
   *
   *     // current msg is not part of a thread (i.e. does not have thread_ts set)
   *     msg.
   *      .say('This message will not be part of the thread and will be in the channel')
   *      .thread()
   *      .say('This message will remain in the thread')
   *      .say('This will also be in the thread')
   *
   * ##### Returns
   * - `this` (chainable)
   *
   */

  thread () {
    this.makeThreaded = true

    return this
  }

  /**
   * Ensures all subsequent messages created are not part of a thread
   *
   * Example:
   *
   *     // current msg is part of a thread (i.e. has thread_ts set)
   *     msg.
   *      .say('This message will remain in the thread')
   *      .unthread()
   *      .say('This message will not be part of the thread and will be in the channel')
   *      .say('This will also not be part of the thread')
   *
   *
   * ##### Returns
   * - `this` (chainable)
   *
   */

  unthread () {
    this.makeThreaded = false

    return this
  }

  // TODO: PR this into smallwins/slack, below inspired by https://github.com/smallwins/slack/blob/master/src/_exec.js#L20
  /* istanbul ignore next */
  _request (responseUrl, input, callback) {
    request({
      uri: responseUrl,
      method: 'POST',
      json: input
    }, callback)
  }

  /**
   * Is this from a bot user?
   *
   * ##### Returns `bool` true if `this` is a message from a bot user
   */
  isBot () {
    return !!(this.meta.bot_id || (this.meta.user_id && this.meta.user_id === this.meta.bot_user_id))
  }

  /**
   * Is this an `event` of type `message`?
   *
   *
   * Marked as private until we figure out how to properly handle all of the other subtypes
   * @api private
   * ##### Returns `bool` true if `this` is a message event type
   */

  isMessage () {
    return !!(this.type === 'event' && this.body.event && this.body.event.type === 'message')
  }

  /**
   * Is this an `event` of type `message` without any [subtype](https://api.slack.com/events/message)?
   *
   *
   * ##### Returns `bool` true if `this` is a message event type with no subtype
   */

  isBaseMessage () {
    return this.isMessage() && !this.body.event.subtype
  }

  /**
   * Is this an `event` of type `message` without any [subtype](https://api.slack.com/events/message)?
   *
   *
   * ##### Returns `bool` true if `this` is an event that is part of a thread
   */

  isThreaded () {
    return this.body.event && !!this.body.event.thread_ts
  }

  /**
   * Is this a message that is a direct mention ("@botusername: hi there", "@botusername goodbye!")
   *
   *
   * ##### Returns `bool` true if `this` is a direct mention
   */

  isDirectMention () {
    return this.isBaseMessage() && new RegExp(`^<@${this.meta.bot_user_id}>`, 'i').test(this.body.event.text)
  }

  /**
   * Is this a message in a direct message channel (one on one)
   *
   *
   * ##### Returns `bool` true if `this` is a direct message
   */

  isDirectMessage () {
    return this.isBaseMessage() && this.meta.channel_id[0] === 'D'
  }

  /**
   * Is this a message where the bot user mentioned anywhere in the message.
   * Only checks for mentions of the bot user and does not consider any other users.
   *
   *
   * ##### Returns `bool` true if `this` mentions the bot user
   */

  isMention () {
    return this.isBaseMessage() && new RegExp(`<@${this.meta.bot_user_id}>`, 'i').test(this.body.event.text)
  }

  /**
   * Is this a message that's not a direct message or that mentions that bot at
   * all (other users could be mentioned)
   *
   *
   * ##### Returns `bool` true if `this` is an ambient message
   */

  isAmbient () {
    return this.isBaseMessage() && !this.isMention() && !this.isDirectMessage()
  }

  /**
   * Is this a message that matches any one of the filters
   *
   * ##### Parameters
   * - `messageFilters` Array - any of `direct_message`, `direct_mention`, `mention` and `ambient`
   *
   *
   * ##### Returns `bool` true if `this` is a message that matches any of the filters
   *
   * @param {Array} of {string} messageFilters
   */

  isAnyOf (messageFilters) {
    let found = false
    for (let i = 0; i < messageFilters.length; i++) {
      var filter = messageFilters[i]
      found = found || (filter === 'direct_message' && this.isDirectMessage())
      found = found || (filter === 'direct_mention' && this.isDirectMention())
      found = found || (filter === 'ambient' && this.isAmbient())
      found = found || (filter === 'mention' && this.isMention())
    }
    return found
  }

  /**
   * Return true if the event "team_id" is included in the "authed_teams" array.
   * In other words, this event originated from a team who has installed your app
   * versus a team who is sharing a channel with a team who has installed the app
   * but in fact hasn't installed the app into that team explicitly.
   * There are some events that do not include an "authed_teams" property. In these
   * cases, error on the side of claiming this IS from an authed team.
   *
   * ##### Returns an Array of user IDs
   */

  isAuthedTeam () {
    // if the authed_teams property does not exist, error on the side of claiming it is an authed team_id
    if (!Array.isArray(this.body.authed_teams)) {
      return true
    }
    return this.body.authed_teams.indexOf(this.body.team_id) >= 0
  }

  /**
   * Return the user IDs of any users mentioned in the message
   *
   * ##### Returns an Array of user IDs
   */

  usersMentioned () {
    return this._regexMentions(new RegExp('<@([UW][A-Za-z0-9]+)>', 'g'))
  }

  /**
   * Return the channel IDs of any channels mentioned in the message
   *
   * ##### Returns an Array of channel IDs
   */

  channelsMentioned () {
    return this._regexMentions(new RegExp('<#(C[A-Za-z0-9]+)[^>]+>', 'g'))
  }

  /**
   * Return the IDs of any subteams (groups) mentioned in the message
   *
   * ##### Returns an Array of subteam IDs
   */
  subteamGroupsMentioned () {
    return this._regexMentions(new RegExp('<!subteam\\^(S[A-Za-z0-9]+)[^>]+>', 'g'))
  }

  /**
   * Was "@everyone" mentioned in the message
   *
   * ##### Returns `bool` true if `@everyone` was mentioned
   */

  everyoneMentioned () {
    return this._regexMentions(new RegExp('<!everyone>', 'g')).length > 0
  }

  /**
   * Was the current "@channel" mentioned in the message
   *
   * ##### Returns `bool` true if `@channel` was mentioned
   */

  channelMentioned () {
    return this._regexMentions(new RegExp('<!(channel)[^>]*>', 'g')).length > 0
  }

  /**
   * Was the "@here" mentioned in the message
   *
   * ##### Returns `bool` true if `@here` was mentioned
   */

  hereMentioned () {
    return this._regexMentions(new RegExp('<!(here)[^>]*>', 'g')).length > 0
  }

  /**
   * Return the URLs of any links mentioned in the message
   *
   * ##### Returns `Array:string` of URLs of links mentioned in the message
   */

  linksMentioned () {
    let links = []
    let re = new RegExp('<([^@^>]+)>', 'g')
    let matcher

    if (this.isBaseMessage()) {
      do {
        matcher = re.exec(this.body.event.text)
        if (matcher) {
          links.push(matcher[1].split('|')[0])
        }
      } while (matcher)
    }

    return links
  }

  /**
   * Strip the direct mention prefix from the message text and return it. The
   * original text is not modified
   *
   *
   * ##### Returns `string` original `text` of message with a direct mention of the bot
   * user removed. For example, `@botuser hi` or `@botuser: hi` would produce `hi`.
   * `@notbotuser hi` would produce `@notbotuser hi`
   */

  stripDirectMention () {
    var text = ''
    if (this.isBaseMessage()) {
      text = this.body.event.text || ''
      let match = text.match(new RegExp(`^<@${this.meta.bot_user_id}>:{0,1}(.*)`))
      if (match) {
        text = match[1].trim()
      }
    }
    return text
  }

  /**
   * ##### Returns array of regex matches from the text of a message
   *
   * @api private
   */

  _regexMentions (re) {
    let matches = []
    let matcher

    if (this.isBaseMessage()) {
      do {
        matcher = re.exec(this.body.event.text)
        if (matcher) {
          matches.push(matcher[1])
        }
      } while (matcher)
    }
    return matches
  }

  /**
   * Preprocess `chat.postmessage` input.
   *
   * If an array, pick a random item of the array.
   * If a string, wrap in a `chat.postmessage` params object
   *
   * @api private
   */

  _processInput (input) {
    // if input is an array, randomly pick one of the values
    if (Array.isArray(input)) {
      input = input[Math.floor(Math.random() * input.length)]
    }

    if (typeof input === 'string') {
      input = {
        text: input
      }
    }

    return input
  }

  _queueRequest (fn) {
    if (!this._queue) {
      this._queue = new Queue()
    }
    this._queue.add(fn)
  }

  verifyProps () {
    let missing = []

    if (!this.meta.app_token) missing.push('app_token')
    if (!this.meta.team_id) missing.push('team_id')

    if (missing.length === 0) {
      return null
    }

    return new Error(`Cannot process message because the following properties are missing from message.meta: ${missing.join(',')}`)
  }

}

module.exports = Message
