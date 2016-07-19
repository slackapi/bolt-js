const request = require('request')

module.exports = function(options) {
  var opts = options || {};
  return new SlackApp(opts)
};

class SlackApp {
  constructor(opts) {
    this.middleware = []
    this.matchers = []
    this.registry = {}

    this.app_token = opts.app_token
    this.app_user_id = opts.app_user_id
    this.bot_token = opts.bot_token
    this.bot_user_id = opts.bot_user_id

    // If convo_store is a string, initialize that type of conversation store
    // If it's not a sting and it is defined, assume it is an impmementation of
    // a converation store
    if (opts.convo_store) {
      if (typeof opts.convo_store === 'string') {
        this.convoStore = require('./conversation')({ type: opts.convo_store })
      } else {
        this.convoStore = opts.convo_store
      }
    } else {
      this.convoStore = require('./conversation')()
    }

    this.onError = opts.error || (() => {})
    this.client = opts.client || require('slack')

    this.receiver = require('./receiver')(opts)
    this.receiver.on('request', this.handle.bind(this))

    this.use(this.preprocessConversationMiddleware())
  }

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

  use(fn) {
    this.middleware.push(fn)
  }

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

  attachToExpress(app) {
    return this.receiver.attachToExpress(app)
  }

  register(key, fn) {
    this.registry[key] = fn
  }

  // startConvo(req, expSeconds) {
  //   var convoId = req.convoId
  //   if (!convoId) throw new Error('Conversation ID is missing, is middleware configured?')
  //   var convo = new Conversation(this, convoId)
  //   this.convoStore.set(convoId, '', {}, expSeconds)
  //   return convo
  // }

  hear(criteria, cb) {
    if (typeof criteria === 'string') {
      criteria = new RegExp(criteria, 'i')
    }
    this.matchers.push({ type: 'hear', match: criteria, handler: cb })
  }

  action(actionName, cb) {
    this.matchers.push({ type: 'action', name: actionName, handler: cb })
  }
}

class Conversation {
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
