'use strict'
// TODO: Move this file to src/receiver/index.js

const EventEmitter = require('events')
const fs = require('fs')
const Message = require('./message')
const ParseEvent = require('./receiver/middleware/parse-event')
const ParseCommand = require('./receiver/middleware/parse-command')
const ParseAction = require('./receiver/middleware/parse-action')
const LookupTokens = require('./receiver/middleware/tokens')
const VerifyToken = require('./receiver/middleware/verify-token')

/**
 * Receives HTTP requests with Events, Slash Commands, and Actions
 * @private
 */
module.exports = class Receiver extends EventEmitter {
  constructor (opts) {
    super()
    let self = this
    opts = opts || {}

    this.debug = opts.debug
    this.verify_token = opts.verify_token
    this.tokensLookup = opts.tokensLookup || LookupTokens(opts)

    // record all events to a JSON line delimited file if record is set
    if (opts.record) {
      self.started = Date.now()
      fs.writeFileSync(opts.record, '')
      self.on('message', (obj) => {
        fs.appendFile(opts.record, JSON.stringify(Object.assign({}, obj, { delay: Date.now() - this.started })) + '\n')
      })
    }

    self.logfn = {
      'event': self.logEvent.bind(self),
      'command': self.logCommand.bind(self),
      'action': self.logAction.bind(self)
    }
  }

  /**
   * Attach receiver HTTP route to an express app
   */
  attachToExpress (app, options) {
    options = Object.assign({
      event: true,
      command: true,
      action: true
    }, options || {})

    let emitHandler = this.emitHandler.bind(this)
    let verifyToken = VerifyToken(this.verify_token)

    if (options.event) {
      app.post('slackapp/event',
        ParseEvent(),
        verifyToken,
        this.tokensLookup,
        emitHandler
      )
    }

    if (options.command) {
      app.post('/slackapp/command',
        ParseCommand(),
        verifyToken,
        this.tokensLookup,
        emitHandler
      )
    }

    if (options.action) {
      app.post('/slackapp/action',
        ParseAction(),
        verifyToken,
        this.tokensLookup,
        emitHandler
      )
    }

    return app
  }

  emitHandler (req, res, next) {
    let message = req.slackapp

    if (!message) {
      return res.send('Missing req.slackapp')
    }

    if (this.debug && this.logfn[message.type]) {
      this.logfn[message.type](message.body)
    }

    let msg = new Message(message.type, message.body, message.meta)
    this.emit('message', msg)
  }

  tokenMiddleware (req, res, next) {
    if (req.headers['bb-error']) {
      console.error('Event: Error: ' + req.headers['bb-error'])
      return res.send(req.headers['bb-error'])
    }
    req.app_details = {
      // token for the user for the app
      app_token: req.headers['bb-slackaccesstoken'] || this.app_token,
      // userID for the user who install ed the app
      app_user_id: req.headers['bb-slackuserid'] || this.app_user_id,
      // token for a bot user of the app
      bot_token: req.headers['bb-slackbotaccesstoken'] || this.bot_token,
      // userID of the bot user of the app
      bot_user_id: req.headers['bb-slackbotuserid'] || this.bot_user_id
    }

    next()
  }

  eventHandler (req, res) {
    let body = req.body

    // test verify token
    // if (this.verify_token && this.verify_token !== body.token) {
    //   res.status(403).send('Invalid token')
    //   return
    // }

    // if this is a Slack challenge request, respond with the challenge and
    // don't emit the event
    // if (body.challenge) {
    //   res.send({ challenge: body.challenge })
    //   return
    // }

    this.doEmit('event', body, req.app_details)
    return res.send()
  }

  commandHandler (req, res) {
    let body = req.body

    // test verify token
    // if (this.verify_token && this.verify_token !== body.token) {
    //   res.status(403).send('Invalid token')
    //   return
    // }

    this.doEmit('command', body, req.app_details)
    return res.send()
  }

  actionHandler (req, res) {
    // let body = req.body
    // if (!body || !body.payload) {
    //   return res.send('Invalid request: payload missing')
    // }
    // body = JSON.parse(body.payload)

    // test verify token
    // if (this.verify_token && this.verify_token !== body.token) {
    //   res.status(403).send('Invalid token')
    //   return
    // }

    this.doEmit('action', body, req.app_details)
    return res.send()
  }

  doEmit (type, body, appDetails) {
    if (!body || body && body.ssl_check) {
      return
    }

    if (this.debug && this.logfn[type]) this.logfn[type](body)
    const meta = Object.assign({}, this.parseMeta(type, body), appDetails)
    let msg = new Message(type, body, meta)
    this.emit('message', msg)
  }

  parseMeta (type, body) {
    switch (type) {
      case 'event':
        return {
          user_id: body.event.user,
          bot_id: body.event.bot_id,
          channel_id: body.event.channel,
          team_id: body.team_id
        }
      case 'command':
        return {
          user_id: body.user_id,
          channel_id: body.channel_id,
          team_id: body.team_id
        }
      case 'action':
        return {
          user_id: body.user.id,
          channel_id: body.channel.id,
          team_id: body.team.id
        }
      default:
        return {}
    }
  }

  logEvent (evt) {
    if (!evt) return console.log('Event: UNKNOWN')
    if (!evt.event) return console.log('Event: Missing:', evt)
    let out = evt.event.user + ' -> ' + evt.event.type
    switch (evt.event.type) {
      case 'reaction_added':
        out += ' : ' + evt.event.item.type + '[' + evt.event.item.channel + ']' + ' : ' + evt.event.reaction
        break
      case 'message':
        if (evt.event.subtype) {
          out += ' : ' + evt.event.subtype + '[' + evt.event.channel + ']' + ' : ' + evt.event.text
        } else {
          out += ' : ' + evt.event.channel + ' : ' + evt.event.text
        }
        break
    }
    console.log(out)
  }

  logCommand (cmd) {
    if (!cmd) return console.log('Command: UNKNOWN')
    if (!cmd.command) return console.log('Command: Missing:', cmd)
    console.log(cmd.user_id + ' -> ' + cmd.command + ' ' + cmd.text)
  }

  logAction (action) {
    if (!action) return console.log('Action: UNKNOWN')
    console.log('Action:', action)
  }

}
