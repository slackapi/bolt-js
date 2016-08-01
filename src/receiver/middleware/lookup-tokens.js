'use strict'

// Enrich `req.slapp.meta` with tokens and user ids parsed from Beep Boop headers
module.exports = () => {
  return function tokenMiddleware (req, res, next) {
    if (req.headers['bb-error']) {
      console.log('Event: Error: ' + req.headers['bb-error'])
      return res.send(req.headers['bb-error'])
    }

    if (!req.slapp) {
      return res.send('Missing req.slapp')
    }

    req.slapp.meta = Object.assign(req.slapp.meta || {}, {
      // token for the user for the app
      app_token: req.headers['bb-slackaccesstoken'],
      // userID for the user who install ed the app
      app_user_id: req.headers['bb-slackuserid'],
      // token for a bot user of the app
      bot_token: req.headers['bb-slackbotaccesstoken'],
      // userID of the bot user of the app
      bot_user_id: req.headers['bb-slackbotuserid'],
      // additional bot and team meta-data
      bot_user_name: req.headers['bb-slackbotusername'],
      team_name: req.headers['bb-slackteamname'],
      team_domain: req.headers['bb-slackteamdomain']
    })

    next()
  }
}
