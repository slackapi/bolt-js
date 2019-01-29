'use strict'

const bodyParser = require('body-parser')
const verify = require('./body-parser-verify')

module.exports = () => {
  return [
    bodyParser.urlencoded({ extended: true, verify: verify }),
    function parseCommand (req, res, next) {
      let body = req.body

      req.slapp = {
        type: 'command',
        body: body,
        meta: {
          verify_token: body.token,
          signature: (req.headers || {})['x-slack-signature'],
          timestamp: (req.headers || {})['x-slack-request-timestamp'],
          user_id: body.user_id,
          channel_id: body.channel_id,
          team_id: body.team_id
        },
        // Slash Commands requests may be responded to directly within 3000ms
        response: res,
        responseTimeout: 2500
      }

      next()
    }
  ]
}
