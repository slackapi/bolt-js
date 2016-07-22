'use strict'

const request = require('request')
const slack = require('slack')

module.exports = class Message {
  constructor (type, body, meta) {
    this.type = type
    this.body = body
    this.meta = meta
    this.conversation_id = [meta.team_id, meta.channel_id, meta.user_id || meta.bot_id].join('::')

    this._slackapp = null
  }

  attachSlackApp (slackapp) {
    this._slackapp = slackapp
  }

  attachOverrideRoute (fnKey, state) {
    let fn = this._slackapp.getRoute(fnKey)

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
   * The route should be registered already through `slackapp.route`
   *
   * Parameters
   * - `fnKey` `string`
   * - `state` `object` arbitrary data to be passed back to your function [optional]
   * - `secondsToExpire` `number` - number of seconds to wait for the next message in the conversation before giving up. Default 60 minutes [optional]
   */

  route (fnKey, state, secondsToExpire) {
    const hour = 60 * 60
    if (!state) {
      state = {}
    }

    if (!secondsToExpire) {
      secondsToExpire = hour
    }

    let key = this.conversation_id
    let expiration = Date.now() + secondsToExpire * 1000
    this._slackapp.convoStore.set(key, { fnKey, state, expiration })
    return this
  }

  /**
   * Explicity cancel `route` registration.
   */

  cancel () {
    this._slackapp.convoStore.del(this.conversation_id)
  }

  /**
   * Send a message through `chat.postmessage` that defaults to current channel and tokens
   *
   * Parameters
   * - `input` `string` or `object` or `Array`
   *     * type `object`: raw object that would be past to `chat.postmessage`
   *     * type `string`: text of a message that will be used to construct object sent to `chat.postmessage`
   *     * type `Array`: of strings or objects above to be picked randomly (can be mixed!)
   *
   * - `callback` string - (err, data) => {}
   */

  say (input, callback) {
    if (!callback) callback = () => {}

    input = this._processInput(input)

    let payload = Object.assign({}, input, {
      token: this.meta.bot_token || this.meta.app_token,
      channel: this.meta.channel_id
    })

    slack.chat.postMessage(payload, callback)
    return this
  }

  /**
   * Use a `response_url` from a Slash command or interactive message
   *
   * Parameters
   * - `responseUrl` string - URL provided by a Slack interactive message or slash command
   * - `input` string or object or Array
   *     * type `object`: raw object that would be past to `chat.postmessage`
   *     * type `string`: text of a message that will be used to construct object sent to `chat.postmessage`
   *     * type `Array`: of strings or objects above to be picked randomly (can be mixed!)
   *
   * - `callback` string - (err, data) => {}
   */

  respond (responseUrl, input, callback) {
    if (!callback) callback = () => {}

    input = this._processInput(input)

    // TODO: PR this into smallwins/slack, below inspired by https://github.com/smallwins/slack/blob/master/src/_exec.js#L20
    request({
      uri: responseUrl,
      method: 'POST',
      json: input
    }, (err, res, body) => {
      let rateLimit = 'You are sending too many requests. Please relax.'
      if (err) {
        callback(err)
      } else if (body.error) {
        // if Slack returns an error bubble the error
        callback(Error(body.error))
      } else if (typeof body === 'string' && body.includes(rateLimit)) {
        // sometimes you need to chill out
        callback(Error('rate_limit'))
      } else {
        // success! clean up the response
        delete body.ok
        callback(null, body)
      }
    })

    return this
  }

  /**
   * Is this an `event` of type `message`?
   */

  isMessage () {
    return this.type === 'event' && this.body.event && this.body.event.type === 'message'
  }

  /**
   * Is this a message that is a direct mention ("@botusername: hi there", "@botusername goodbye!")
   */

  isDirectMention () {
    return this.isMessage() && new RegExp(`^<@${this.meta.bot_user_id}>`, 'i').test(this.body.event.text)
  }

  /**
   * Is this a message in a direct message channel (one on one)
   */

  isDirectMessage () {
    return this.isMessage() && this.meta.channel_id[0] === 'D'
  }

  /**
   * Is this a message where the bot user mentioned anywhere in the message.
   * This only checks for the bot user and does not consider any other users
   */

  isMention () {
    return this.isMessage() && new RegExp(`<@${this.meta.bot_user_id}>`, 'i').test(this.body.event.text)
  }

  /**
   * Is this a message that's not a direct message or that mentions that bot at
   * all (other users could be mentioned)
   */

  isAmbient () {
    return this.isMessage() && !this.isMention() && !this.isDirectMessage()
  }

  /**
   * Is this a message that matches any one of these filter types
   *
   * Parameters:
   * - `messageFilters` Array - any of direct_message, direct_mention, mention or ambient
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
    console.log('Found', found, messageFilters)
    return found
  }

  /**
   * Return the user IDs of any users mentioned in the message
   *
   * Returns an Array of IDs
   */

  usersMentioned () {
    return this._regexMentions(new RegExp('<@(U[A-Za-z0-9]+)>', 'g'))
  }

  /**
   * Return the channel IDs of any channels mentioned in the message
   *
   * Returns an Array of IDs
   */

  channelsMentioned () {
    return this._regexMentions(new RegExp('<#(C[A-Za-z0-9]+)>', 'g'))
  }

  /**
   * Return the IDs of any subteams (groups) mentioned in the message
   *
   * Returns an Array of IDs
   */
  subteamGroupsMentioned () {
    return this._regexMentions(new RegExp('<!subteam\\^(S[A-Za-z0-9]+)[^>]+>', 'g'))
  }

  /**
   * Was "@everyone" mentioned in the message
   */

  everyoneMentioned () {
    return this._regexMentions(new RegExp('<!everyone>', 'g')).length > 0
  }

  /**
   * Was the current "@channel" mentioned in the message
   */

  channelMentioned () {
    return this._regexMentions(new RegExp('<!(channel)[^>]*>', 'g')).length > 0
  }

  /**
   * Was the current "@channel" mentioned in the message
   */

  hereMentioned () {
    return this._regexMentions(new RegExp('<!(here)[^>]*>', 'g')).length > 0
  }

  /**
   * Return the URLs of any links mentioned in the message
   */

  linksMentioned () {
    let links = []
    let re = new RegExp('<([^@^>]+)>', 'g')
    let matcher

    if (this.isMessage()) {
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
   */

  stripDirectMention () {
    var text = ''
    if (this.isMessage()) {
      text = this.body.event.text
      let match = text.match(new RegExp(`^<@${this.meta.bot_user_id}>:{0,1}(.*)`))
      if (match) {
        text = match[1].trim()
      }
    }
    return text
  }

  /**
   * Returns array of regex matches from the text of a message
   *
   * @api private
   */

  _regexMentions (re) {
    let matches = []
    let matcher

    if (this.isMessage()) {
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

}
