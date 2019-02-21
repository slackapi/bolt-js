'use strict'

const bodyParser = require('body-parser')
const verify = require('./body-parser-verify')

module.exports = () => {
  return [
    bodyParser.urlencoded({ extended: true, verify: verify }),
    bodyParser.text({type: '*/*'}),
    function parseAction (req, res, next) {
      let body = req.body

      if (!body || !body.payload) {
        return res.send('Invalid request: payload missing')
      }

      try {
        body = JSON.parse(body.payload)
      } catch (e) {
        return res.send('Error parsing payload')
      }

      // Blockkit actions do not have callback id. Instead they use the
      // action_id field to identify interactive actions.
      if (body.type === 'block_actions') {
        body.callback_id = body.actions[0].action_id
      }

      req.slapp = {
        type: 'action',
        body: body,
        meta: {
          verify_token: body.token,
          signature: (req.headers || {})['x-slack-signature'],
          timestamp: (req.headers || {})['x-slack-request-timestamp'],
          user_id: body.user.id,
          channel_id: body.channel.id,
          team_id: body.team.id
        }
      }

      // message_action's do not support returning a message in the HTTP response
      if (body.type !== 'message_action') {
        // May be responded to directly within 3000ms
        req.slapp.response = res
        req.slapp.responseTimeout = 2500
      }

      next()
    }
  ]
}
