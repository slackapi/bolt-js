'use strict'
// TODO: Move this file to src/receiver/index.js

const EventEmitter = require('events')
const fs = require('fs')
const Message = require('./message')
const ParseEvent = require('./receiver/middleware/parse-event')
const ParseCommand = require('./receiver/middleware/parse-command')
const ParseAction = require('./receiver/middleware/parse-action')
const LookupTokens = require('./receiver/middleware/lookup-tokens')
const VerifyToken = require('./receiver/middleware/verify-token')
const SSLCheck = require('./receiver/middleware/ssl-check')

/**
 * Receives HTTP requests with Events, Slash Commands, and Actions
 * @private
 */
module.exports = class Receiver extends EventEmitter {
  constructor (opts) {
    super()
    opts = opts || {}

    this.debug = opts.debug
    this.verify_token = opts.verify_token
    this.tokens_lookup = opts.tokens_lookup || LookupTokens(opts)

    // record all events to a JSON line delimited file if record is set
    if (opts.record) {
      this.started = Date.now()
      fs.writeFileSync(opts.record, '')
      this.on('message', (obj) => {
        fs.appendFile(opts.record, JSON.stringify(Object.assign({}, obj, { delay: Date.now() - this.started })) + '\n')
      })
    }

    this.logfn = {
      'event': this.logEvent.bind(this),
      'command': this.logCommand.bind(this),
      'action': this.logAction.bind(this)
    }
  }

  /**
   * Attach receiver HTTP route to an express app
   */
  attachToExpress (app, opts) {
    let defaults = {
      event: '/slackapp/event',
      command: '/slackapp/command',
      action: '/slackapp/action'
    }
    let options = opts || defaults

    // replace any `true` values w/ default paths
    Object.keys(options).forEach((type) => {
      options[type] === true ? defaults[type] : options[type]
    })

    let emitHandler = this.emitHandler.bind(this)
    let verifyToken = VerifyToken(this.verify_token)
    let sslCheck = SSLCheck()

    if (options.event) {
      app.post(options.event,
        ParseEvent(),
        sslCheck,
        verifyToken,
        this.tokens_lookup,
        emitHandler
      )
    }

    if (options.command) {
      app.post(options.command,
        ParseCommand(),
        sslCheck,
        verifyToken,
        this.tokens_lookup,
        emitHandler
      )
    }

    if (options.action) {
      app.post(options.action,
        ParseAction(),
        sslCheck,
        verifyToken,
        this.tokens_lookup,
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
    res.send()
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
