'use strict'

const bodyParser = require('body-parser')

module.exports = () => {
  return [
    bodyParser.urlencoded({extended: true}),
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

      req.slapp = {
        type: 'action',
        body: body,
        meta: {
          verify_token: body.token,
          user_id: body.user.id,
          channel_id: body.channel.id,
          team_id: body.team.id
        },
        // Message actions may be responded to directly within 3000ms
        response: res,
        responseTimeout: 2500
      }

      next()
    }
  ]
}
