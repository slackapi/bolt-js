'use strict'

const bodyParser = require('body-parser')

module.export = () => {
  return [
    bodyParser.json(),
    (req, res, next) => {
      let body = req.body

      req.slackapp = {
        type: 'action',
        body: body,
        meta: {
          verify_token: body.token,
          user_id: body.user.id,
          channel_id: body.channel.id,
          team_id: body.team.id
        }
      }
    }
  ]
}
