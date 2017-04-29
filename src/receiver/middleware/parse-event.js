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
      let channelId = event.channel || (event.item && event.item.channel)
      let userId

      if (typeof event.user === 'string') {
        userId = event.user
      } else if (typeof event.user === 'object') {
        userId = event.user.id
      }

      req.slapp = {
        type: 'event',
        body: body,
        meta: {
          verify_token: body.token,
          user_id: userId,
          bot_id: event.bot_id,
          channel_id: channelId,
          team_id: body.team_id
        }
      }

      next()
    }
  ]
}
