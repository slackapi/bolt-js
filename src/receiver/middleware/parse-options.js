'use strict'

const bodyParser = require('body-parser')

module.exports = () => {
  return [
    bodyParser.urlencoded({extended: true}),
    function parseOptions (req, res, next) {
      let body = req.body

      if (!body || !body.payload) {
        return next(new Error('Invalid request: payload missing'))
      }

      try {
        body = JSON.parse(body.payload)
      } catch (e) {
        return next(new Error('Error parsing payload'))
      }

      req.slapp = {
        type: 'options',
        body: body,
        meta: {
          verify_token: body.token,
          user_id: body.user && body.user.id,
          channel_id: body.channel && body.channel.id,
          team_id: body.team && body.team.id
        },
        // Options must be handled very quickly within ???
        response: res,
        responseTimeout: 3000
      }

      next()
    }
  ]
}
