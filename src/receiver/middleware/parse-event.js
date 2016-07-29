'use strict'

const bodyParser = require('body-parser')

module.exports = () => {
  return [
    bodyParser.json(),
    function handleChallenge (req, res, next) {
      let body = req.body || {}

      // if this is a Slack challenge request, respond with the challenge and
      // don't emit the event
      if (body.challenge) {
        return res.send({ challenge: body.challenge })
      }

      next()
    },
    function parseEvent (req, res, next) {
      let body = req.body || {}
      let event = body.event || {}

      req.slapp = {
        type: 'event',
        body: body,
        meta: {
          verify_token: body.token,
          user_id: event.user,
          bot_id: event.bot_id,
          channel_id: event.channel,
          team_id: body.team_id
        }
      }

      next()
    }
  ]
}
