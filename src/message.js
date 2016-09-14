'use strict'
const request = require('request')
const slack = require('slack')
const Queue = require('js-queue')
const HOUR = 60 * 60
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
    this.conversation_id = [
      this.meta.team_id,
      this.meta.channel_id || 'nochannel',
      this.meta.user_id || this.meta.bot_id || 'nouser'
    ].join('::')

    this._slapp = null
    this._queue = null
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

    if (!secondsToExpire) {
      secondsToExpire = HOUR
    }

    let key = this.conversation_id
    let expiration = Date.now() + secondsToExpire * 1000
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
   * Use a `response_url` from a Slash command or interactive message action with
   * a [`chat.postmessage`](https://api.slack.com/methods/chat.postMessage) payload.
   * `input` options are the same as [`say`](#messagesay)
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

    if (!responseUrl) {
      return callback(new Error('responseUrl not provided or not included as response_url with this type of Slack event'))
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
   * Return the user IDs of any users mentioned in the message
   *
   * ##### Returns an Array of user IDs
   */

  usersMentioned () {
    return this._regexMentions(new RegExp('<@(U[A-Za-z0-9]+)>', 'g'))
  }

  /**
   * Return the channel IDs of any channels mentioned in the message
   *
   * ##### Returns an Array of channel IDs
   */

  channelsMentioned () {
    return this._regexMentions(new RegExp('<#(C[A-Za-z0-9]+)>', 'g'))
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
