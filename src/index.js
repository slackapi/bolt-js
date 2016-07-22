const SlackApp = require('./slackapp')

module.exports = (opts) => {
  let app = new SlackApp(opts)

  return app.init()
}
