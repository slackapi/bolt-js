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
    this.data = data
    this.slackapp.convoStore.set(this.id, fnKey, data, exp)
  }

  done() {
    this.slackapp.convoStore.del(this.id)
  }

  say(something, cb) {
    if (!cb) cb = (() => {})
    if (typeof something === 'string') {
      something = {
        text: something
      }
    }

    var msg = Object.assign({}, something, {
      token: this.slackapp.bot_token || this.slackapp.app_token,
      channel: this.getChannelId(),
    })

    this.slackapp.client.chat.postMessage(msg, cb.bind(this))
  }

  updateAction(responseURL, payload, cb) {
    if (!cb) cb = (() => {})
    request({
      uri: responseURL,
      method: 'POST',
      json: payload
    }, cb)
  }

  getChannelId() {
    return this.id.split(':')[1]
  }
}
