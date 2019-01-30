import EventEmitter from 'events';
const fs = require('fs')
const Message = require('../message')
const ParseEvent = require('./middleware/parse-event')
const ParseCommand = require('./middleware/parse-command')
const ParseAction = require('./middleware/parse-action')
const ParseOptions = require('./middleware/parse-options')
const VerifyToken = require('./middleware/verify-token')
const CheckSignature = require('./middleware/check-signature')
const SSLCheck = require('./middleware/ssl-check')

/*

interface EventsAPIBody {

}

type EventBody = EventsAPIBody;

export interface Event<B extends EventBody> {
  body: B;
}

*/

// TODO: make this generic on the body
export interface Event {
  body: object;
  ack: (message?: string | object) => void;
  // TODO: maybe respond shouldn't be handled by the receiver at all
  respond?: (message: string | object) => void;
}

export interface Receiver {
  on(event: 'message', listener: (event: Event) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
}

/**
 * Receives HTTP requests with Events, Slash Commands, and Actions
 * @private
 */
export default class ExpressReceiver extends EventEmitter implements Receiver {
  constructor (opts) {
    super()
    opts = opts || {}

    this.verify_token = opts.verify_token
    this.signing_secret = opts.signing_secret
    this.signing_version = opts.signing_version
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

    let defaultMiddlware = [
      SSLCheck(),
      VerifyToken(this.verify_token, this.emit.bind(this, 'error')),
      CheckSignature(this.signing_secret, this.signing_version, this.emit.bind(this, 'error')),
      this.context,
      this.emitHandler.bind(this)
    ]

    if (options.event) {
      app.post(options.event,
        ParseEvent(),
        ...defaultMiddlware
      )
    }

    if (options.command) {
      app.post(options.command,
        ParseCommand(),
        ...defaultMiddlware
      )
    }

    if (options.action) {
      app.post(options.action,
        ParseAction(),
        ...defaultMiddlware
      )
    }

    if (options.options) {
      app.post(options.options,
        ParseOptions(),
        ...defaultMiddlware
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
