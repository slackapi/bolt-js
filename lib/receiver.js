const EventEmitter = require('events')
const bodyParser = require('body-parser')
const fs = require('fs')

module.exports = class Receiver extends EventEmitter {
  constructor (opts) {
    super()
    var self = this
    opts = opts || {}

    this.debug = opts.debug
    this.app_token = opts.app_token
    this.app_user_id = opts.app_user_id
    this.bot_token = opts.bot_token
    this.bot_user_id = opts.bot_user_id

    // record all events to a JSON line delimited file if record is set
    if (opts.record) {
      self.started = Date.now()
      fs.writeFileSync(opts.record, '')
      self.on('request', (obj) => {
        fs.appendFile(opts.record, JSON.stringify(Object.assign({}, obj, { delay: Date.now() - this.started})) + '\n')
      })
    }

    self.logfn = {
      'event': self.logEvent.bind(self),
      'command': self.logCommand.bind(self),
      'interactive': self.logInteractive.bind(self)
    }

  }

  /**
   * Attach receiver HTTP route to an express app
   */
  attachToExpress (app) {
    app.post('/slack-event',
             this.tokenMiddleware.bind(this),
             bodyParser.json(),
             this.eventHandler.bind(this))
    app.post('/slack-command',
             this.tokenMiddleware.bind(this),
             bodyParser.urlencoded({extended:true}),
             this.commandHandler.bind(this))
    app.post('/slack-interactive',
             this.tokenMiddleware.bind(this),
             bodyParser.urlencoded({extended:true}),
             bodyParser.text({type: '*/*'}),
             this.interactiveHandler.bind(this))
    return app
  }

  tokenMiddleware (req, res, next) {
    if (req.headers["bb-error"]) {
      console.error("Event: Error: " + req.headers["bb-error"])
      return res.send(req.headers["bb-error"])
    }
    req.bb = {
      // token for the user for the app
      app_token: req.headers["bb-slackaccesstoken"] || this.app_token,
      // userID for the user who install ed the app
      app_user_id: req.headers["bb-slackuserid"] || this.app_user_id,
      // token for a bot user of the app
      bot_token: req.headers["bb-slackbotaccesstoken"] || this.bot_token,
      // userID of the bot user of the app
      bot_user_id: req.headers["bb-slackbotuserid"] || this.bot_user_id,
    }

    next()
  }

  eventHandler (req, res) {
    var body = req.body
    this.doEmit('event', body, req.bb)
    return res.send()
  }

  commandHandler (req, res) {
    var body = req.body
    this.doEmit('command', body, req.bb)
    return res.send()
  }

  interactiveHandler (req, res) {
    var body = req.body
    if (!body || !body.payload) {
      return res.send('Invalid request: payload missing')
    }
    body = JSON.parse(body.payload)
    this.doEmit('interactive', body, req.bb)
    return res.send()
  }

  doEmit (type, payload, resource) {
    if (payload && payload.ssl_check) {
      return
    }

    if (this.debug && this.logfn[type]) this.logfn[type](payload)

    var o = {
      type: type,
      body: payload,
      resource: resource,
      meta: this.parseMeta(type, payload)
    }

    this.emit('request', o)
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
      case 'interactive':
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
    var out = evt.event.user + ' -> ' + evt.event.type
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

  logInteractive (interactive) {
    if (!interactive) return console.log('Interactive: UNKNOWN')
    console.log('Interactive:', interactive)
  }

}
