'use strict'

const EventEmitter = require('events')
const fs = require('fs')
const Message = require('../message')
const ParseEvent = require('./middleware/parse-event')
const ParseCommand = require('./middleware/parse-command')
const ParseAction = require('./middleware/parse-action')
const ParseOptions = require('./middleware/parse-options')
const VerifyToken = require('./middleware/verify-token')
const SSLCheck = require('./middleware/ssl-check')

/**
 * Receives HTTP requests with Events, Slash Commands, and Actions
 * @private
 */
module.exports = class Receiver extends EventEmitter {
  constructor (opts) {
    super()
    opts = opts || {}

    this.verify_token = opts.verify_token
    this.context = opts.context

    // record all events to a JSON line delimited file if record is set
    if (opts.record) {
      this.started = Date.now()
      fs.writeFileSync(opts.record, '')
      this.on('message', (obj) => {
        fs.appendFile(opts.record, JSON.stringify(Object.assign({}, obj, { delay: Date.now() - this.started })) + '\n')
      })
    }
  }

  /**
   * Attach receiver HTTP route to an express app
   */
  attachToExpress (app, opts) {
    let defaults = {
      event: '/slack/event',
      command: '/slack/command',
      action: '/slack/action',
      options: '/slack/options'
    }
    let options = opts || defaults

    // replace any `true` values w/ default paths
    Object.keys(options).forEach((type) => {
      options[type] = options[type] === true ? defaults[type] : options[type]
    })

    let emitHandler = this.emitHandler.bind(this)
    let verifyToken = VerifyToken(this.verify_token, this.emit.bind(this, 'error'))
    let sslCheck = SSLCheck()

    if (options.event) {
      app.post(options.event,
        ParseEvent(),
        sslCheck,
        verifyToken,
        this.context,
        emitHandler
      )
    }

    if (options.command) {
      app.post(options.command,
        ParseCommand(),
        sslCheck,
        verifyToken,
        this.context,
        emitHandler
      )
    }

    if (options.action) {
      app.post(options.action,
        ParseAction(),
        sslCheck,
        verifyToken,
        this.context,
        emitHandler
      )
    }

    if (options.options) {
      app.post(options.options,
        ParseOptions(),
        sslCheck,
        verifyToken,
        this.context,
        emitHandler
      )
    }

    return app
  }

  emitHandler (req, res) {
    let message = req.slapp

    if (!message) {
      return res.send('Missing req.slapp')
    }

    let msg = new Message(message.type, message.body, message.meta)

    if (message.response && message.responseTimeout) {
      // Attaching the response will delegate responsibility of closing it
      this.attachResponse(msg, message.response, message.responseTimeout)
    } else {
      res.send()
    }

    this.emit('message', msg)
  }

  attachResponse (msg, response, timeout) {
    msg.attachResponse(response, timeout)
  }

}

