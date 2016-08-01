'use strict'

const test = require('ava').test
const chalk = require('chalk')
// const sinon = require('sinon')
const Formatter = require('../src/message-formatter')

const eventMsg = require('./fixtures/messages/event.message')
const eventMsgBotMsg = require('./fixtures/messages/event.message.bot_message')
const actionMsg = require('./fixtures/messages/action')
const commandMsg = require('./fixtures/messages/command')

test('Formatter()', t => {
  let format = Formatter()

  t.is(typeof format, 'function')
})

test('Formatter() unknown w/ colors', t => {
  let format = Formatter()
  let msg = { type: 'beepboop' }

  let output = format(msg)
  t.true(output.indexOf('Unknown type') >= 0)
  t.true(output.indexOf(chalk.gray('[beepboop]')) >= 0)
})

test('Formatter() unknown w/o colors', t => {
  let format = Formatter({ colors: false })
  let msg = { type: 'beepboop' }

  let output = format(msg)

  t.true(output.indexOf('Unknown type') >= 0)
  t.true(output.indexOf('beepboop') >= 0)
})

test('Formatter() event message', t => {
  let format = Formatter()
  let output = format(eventMsg)

  t.true(output.indexOf('[evt]') >= 0)
})

test('Formatter() event message.bot_message', t => {
  let format = Formatter()
  let output = format(eventMsgBotMsg)

  t.true(output.indexOf('[evt]') >= 0)
})

test('Formatter() action', t => {
  let format = Formatter()
  let output = format(actionMsg)

  t.true(output.indexOf('[act]') >= 0)
})

test('Formatter() command', t => {
  let format = Formatter()
  let output = format(commandMsg)

  t.true(output.indexOf('[cmd]') >= 0)
})

test('Formatter() no message', t => {
  let format = Formatter()
  let output = format()

  t.is(output, null)
})
