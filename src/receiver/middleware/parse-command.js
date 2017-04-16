'use strict'

const bodyParser = require('body-parser')

let parse

module.exports = parse = () => {
  return [
    bodyParser.urlencoded({extended: true}),
    function parseCommand (req, res, next) {
      let body = req.body

      req.slapp = parse.slappData(body)

      // Message actions may be responded to directly within 3000ms
      req.slapp.response = res
      req.slapp.responseTimeout = 2500

      next()
    }
  ]
}

parse.slappData = body => {
  return {
    type: 'command',
    body: body,
    meta: {
      verify_token: body.token,
      user_id: body.user_id,
      channel_id: body.channel_id,
      team_id: body.team_id
    }
  }
}
