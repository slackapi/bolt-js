const chalk = require('chalk')

module.exports = (app) => {
  app
    .on('info', info => {
      console.log([chalk.green('slapp:info'), info].join(' '))
    })
    .on('error', err => {
      console.log([chalk.red('slapp:error'), err.message || err].join(' '))
    })
}
