'use strict'

// Enrich `req.slackapp.meta` with tokens and user ids parsed from Beep Boop headers
module.exports = (options) => {
  options = options || {}

  return function tokenMiddleware (req, res, next) {
    if (req.headers['bb-error']) {
      console.error('Event: Error: ' + req.headers['bb-error'])
      return res.send(req.headers['bb-error'])
    }

    if (!req.slackapp) {
      return res.send('Missing req.slackapp')
    }

    req.slackapp.meta = Object.assign(req.slackapp.meta || {}, {
      // token for the user for the app
      app_token: req.headers['bb-slackaccesstoken'] || options.app_token,
      // userID for the user who install ed the app
      app_user_id: req.headers['bb-slackuserid'] || options.app_user_id,
      // token for a bot user of the app
      bot_token: req.headers['bb-slackbotaccesstoken'] || options.bot_token,
      // userID of the bot user of the app
      bot_user_id: req.headers['bb-slackbotuserid'] || options.bot_user_id
    })

    next()
  }
}
