'use strict'

const chalk = require('chalk')
const Formatter = require('./message-formatter')

export default (app, opts) => {
  opts = opts || {}
  let colors = opts.colors
  const formatter = Formatter({
    colors
  })

  function c (val, color) {
    return colors ? chalk[color](val) : val
  }

  app
    .on('info', msg => {
      console.log([c('slapp:info', 'green'), formatter(msg)].join(' '))
    })
    .on('error', err => {
      console.log([c('slapp:error', 'red'), (err && err.message) || err].join(' '))
    })
};

export interface Logger {
}
