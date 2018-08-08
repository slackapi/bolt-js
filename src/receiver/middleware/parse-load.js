'use strict'

const bodyParser = require('body-parser')
const verify = require('./body-parser-verify')

module.exports = () => {
  return [
    bodyParser.urlencoded({ extended: true, verify: verify }),
    bodyParser.text({type: '*/*'}),
    function parseLoader (req, res, next) {
      let body = req.body

      if (!body || !body.payload) {
        return res.send('Invalid request: payload missing')
      }

      try {
        body = JSON.parse(body.payload)
      } catch (e) {
        return res.send('Error parsing payload')
      }

      req.slapp = {
        type: 'load',
        body: body,
        meta: {
          verify_token: body.token,
          signature: (req.headers || {})['x-slack-signature'],
          timestamp: (req.headers || {})['x-slack-request-timestamp'],
          user_id: body.user.id,
          channel_id: body.channel.id,
          team_id: body.team.id
        },
        // Loaders must be handled very quickly within ???
        response: res,
        responseTimeout: 3000
      }

      next()
    }
  ]
}
