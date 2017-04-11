'use strict'

const bodyParser = require('body-parser')

module.exports = () => {
  return [
    bodyParser.urlencoded({extended: true}),
    function parseCommand (req, res, next) {
      let body = req.body

      req.slapp = {
        type: 'command',
        body: body,
        meta: {
          verify_token: body.token,
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
