const request = require('request')
const slack = require('slack')

module.exports = class Message {
  constructor(type, body, meta) {
    this.type = type
    this.body = body
    this.meta = meta
    this.conversation_id = [meta.team_id, meta.channel_id, meta.user_id || meta.bot_id].join('::')

    this._slackapp = null
  }

  attachSlackApp(slackapp) {
    this._slackapp = slackapp
  }

  attachOverrideRoute(fnKey, state) {
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
   * - `secondsToExpire` `number` - number of seconds to wait for the next message in the conversation before giving up. Default 10 minutes [optional]
   */

  route(fnKey, state, secondsToExpire) {
    const tenMinutes = 600
    if (!state) {
      state = {}
    }

    if (!secondsToExpire) {
      secondsToExpire = tenMinutes
    }

    this._slackapp.convoStore.set(this.conversation_id, fnKey, state, secondsToExpire)
    return this
  }

  /**
   * Explicity cancel `route` registration.
   */

  cancel() {
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

  say(input, callback) {
    if (!callback) callback = (() => {})

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
   * - `response_url` string - URL provided by a Slack interactive message or slash command
   * - `input` string or object or Array
   *     * type `object`: raw object that would be past to `chat.postmessage`
   *     * type `string`: text of a message that will be used to construct object sent to `chat.postmessage`
   *     * type `Array`: of strings or objects above to be picked randomly (can be mixed!)
   *
   * - `callback` string - (err, data) => {}
   */

  respond(response_url, input, callback) {
    if (!callback) callback = (() => {})

    input = this._processInput(input)


    // TODO: PR this into smallwins/slack, below inspired by https://github.com/smallwins/slack/blob/master/src/_exec.js#L20
    request({
      uri: response_url,
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

  isMessage() {
    return this.type === 'event' && this.body.event && this.body.event.type === 'message'
  }

  isDirectMention() {
    return this.isMessage() && new RegExp(`^<@${this.meta.bot_user_id}>`, 'i').text(this.body.event.text)
  }

  isDirectMessage() {
    return this.isMessage() && this.meta.channel_id[0] === 'D'
  }

  isMention() {
    this.isMessage() && new RegExp(`<@${this.meta.bot_user_id}>`, 'i').text(this.body.event.text)
  }

  isAmbient() {
    return this.isMessage() && !this.isMention() && !this.isDirectMention()
  }

  usersMentioned() {
    let ids = []
    let re = new RegExp('<@([A-Za-z0-9]+)>', 'g')
    let matcher

    if (this.isMessage()) {
      do {
          matcher = re.exec(this.body.event.text);
          if (matcher) {
              ids.push(matcher[1])
          }
      } while (matcher)
    }
    return ids
  }

  links() {
    let links = []
    let re = new RegExp('<([^@^>]+)>', 'g')
    let matcher

    if (this.isMessage()) {
      do {
          matcher = re.exec(this.body.event.text);
          if (matcher) {
            links.push(matcher[1].split('|')[0])
          }
      } while (matcher)
    }

    return links
  }

  stripDirectMention() {
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

  _processInput(input) {
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
