'use strict'

const chalk = require('chalk')

module.exports = (app, opts) => {
  opts = opts || {}
  let colors = opts.colors

  function c (val, color) {
    return colors ? chalk[color](val) : val
  }

  app
    .on('info', info => {
      console.log([c('slapp:info', 'green'), info].join(' '))
    })
    .on('error', err => {
      console.log([c('slapp:error', 'red'), (err && err.message) || err].join(' '))
    })
}
