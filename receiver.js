const EventEmitter = require('events')
const bodyParser = require('body-parser')
const fs = require('fs')
class Receiver extends EventEmitter {}

module.exports = function (opts) {
  opts = opts || {}
  var receiver = new Receiver()

  // record all events to a JSON line delimited file if record is set
  if (opts.record) {
    receiver.started = Date.now()
    fs.writeFileSync(opts.record, '')
    receiver.on('request', (obj) => {
      fs.appendFile(opts.record, JSON.stringify(Object.assign({}, obj, { delay: Date.now() - receiver.started})) + '\n')
    })
  }

  // attach receiver HTTP route to an express app
  receiver.attachToExpress = (app) => {
    app.post('/slack-event',
             receiver.bbMiddleware,
             bodyParser.json(),
             receiver.eventHandler)
    app.post('/slack-command',
             receiver.bbMiddleware,
             bodyParser.urlencoded({extended:true}),
             receiver.commandHandler)
    app.post('/slack-interactive',
             receiver.bbMiddleware,
             bodyParser.urlencoded({extended:true}),
             bodyParser.text({type: '*/*'}),
             receiver.interactiveHandler)
    return app
  }

  receiver.bbMiddleware = (req, res, next) => {
    if (req.headers["bb-error"]) {
      console.error("Event: Error: " + req.headers["bb-error"])
      return res.send(req.headers["bb-error"])
    }
    req.bb = {
      // token for the user for the app
      app_token: req.headers["bb-slackaccesstoken"] || opts.app_token,
      // userID for the user who install ed the app
      app_user_id: req.headers["bb-slackuserid"] || opts.app_user_id,
      // token for a bot user of the app
      bot_token: req.headers["bb-slackbotaccesstoken"] || opts.bot_token,
      // userID of the bot user of the app
      bot_user_id: req.headers["bb-slackbotuserid"] || opts.bot_user_id,
    }

    next()
  }

  receiver.eventHandler = (req, res) => {
    var body = req.body
    receiver.doEmit('event', body, req.bb)
    return res.send()
  }

  receiver.commandHandler = (req, res) => {
    var body = req.body
    receiver.doEmit('command', body, req.bb)
    res.sendStatus(200)
    return res.send()
  }

  receiver.interactiveHandler = (req, res) => {
    var body = req.body
    if (!body || !body.payload) {
      return res.send('Invalid request: payload missing')
    }
    body = JSON.parse(body.payload)
    receiver.doEmit('interactive', body, req.bb)
    return res.send()
  }

  receiver.doEmit = (type, payload, resource) => {
    if (payload && payload.ssl_check) {
      return
    }

    if (opts.debug && receiver.logfn[type]) receiver.logfn[type](payload)

    var o = {
      type: type,
      body: payload,
      resource: resource,
      meta: receiver.parseMeta(type, payload)
    }

    receiver.emit('request', o)
  }

  receiver.parseMeta = (type, body) => {
    switch (type) {
      case 'event':
        return {
          user_id: body.event.user || body.event.bot_id,
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

  receiver.logfn = {}

  receiver.logfn['event'] = (evt) => {
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

  receiver.logfn['command'] = (cmd) => {
    if (!cmd) return console.log('Command: UNKNOWN')
    if (!cmd.command) return console.log('Command: Missing:', cmd)
    console.log(cmd.user_id + ' -> ' + cmd.command + ' ' + cmd.text)
  }

  receiver.logfn['interactive'] = (interactive) => {
    if (!interactive) return console.log('Interactive: UNKNOWN')
    console.log('Interactive:', interactive)
  }

  return receiver
}
