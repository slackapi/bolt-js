'use strict'

const bodyParser = require('body-parser')

module.export = () => {
  return [
    bodyParser.urlencoded({extended: true}),
    bodyParser.text({type: '*/*'}),
    function handleChallenge (req, res, next) {
      let body = req.body

      // if this is a Slack challenge request, respond with the challenge and
      // don't emit the event
      if (body.challenge) {
        res.send({ challenge: body.challenge })
        return
      }
    },
    function parseEvent (req, res, next) {
      let body = req.body

      if (!body || !body.payload) {
        return res.send('Invalid request: payload missing')
      }

      try {
        body = JSON.parse(body.payload)
      } catch (e) {
        return res.send('Error parsing payload')
      }

      req.slackapp = {
        type: 'event',
        body: body,
        meta: {
          verify_token: body.token,
          user_id: body.event.user,
          bot_id: body.event.bot_id,
          channel_id: body.event.channel,
          team_id: body.team_id
        }
      }
    }
  ]
}
