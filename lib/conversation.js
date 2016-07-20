const request = require('request')

module.exports = class Conversation {
  constructor(slackapp, convoId, data, nextFn) {
    this.id = convoId
    this.slackapp = slackapp
    // this.expiration = Date.now() + (expSeconds || 60*10) * 1000
    this.data = data
    this.nextFn = nextFn
  }

  next(fnKey, data, exp) {
    // set what's next for the conversation and set data
    this.slackapp.convoStore.set(this.id, fnKey, data, exp)
    return this
  }

  done() {
    this.slackapp.convoStore.del(this.id)
  }

  say(input, cb) {
    if (!cb) cb = (() => {})

    input = this.preprocessInput(input)

    var msg = Object.assign({}, input, {
      token: this.slackapp.bot_token || this.slackapp.app_token,
      channel: this.getChannelId(),
    })

    this.slackapp.client.chat.postMessage(msg, cb.bind(this))
    return this
  }

  updateActionMessage(responseURL, input, cb) {
    if (!cb) cb = (() => {})

    input = this.preprocessInput(input)

    request({
      uri: responseURL,
      method: 'POST',
      json: input
    }, cb)
    return this
  }

  preprocessInput(input) {
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

  getChannelId() {
    return this.id.split(':')[1]
  }
}
