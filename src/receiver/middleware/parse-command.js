'use strict'

const bodyParser = require('body-parser')

module.export = () => {
  return [
    bodyParser.urlencoded({extended: true}),
    (req, res, next) => {
      let body = req.body

      req.slackapp = {
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
  ]
}
