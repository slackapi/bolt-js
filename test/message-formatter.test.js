'use strict'

const test = require('ava').test
const sinon = require('sinon')
const Formatter = require('../src/message-formatter')

const eventMsgBotMsg = require('./fixtures/messages/event.message.bot_message')

test('Formatter()', t => {
  let format = Formatter()

  t.is(typeof format, 'function')
})

test('Formatter() unknown w/ colors', t => {
  let format = Formatter()
  let msg = { type: 'beepboop' }

  let output = format(msg)

  t.is(output, `Unknown type: ${'beepboop'.gray}`)
})

test('Formatter() unknown w/o colors', t => {
  let format = Formatter({ colors: false })
  let msg = { type: 'beepboop' }

  let output = format(msg)

  t.is(output, 'Unknown type: beepboop')
})

test('Formatter() event message.bot_message', t => {
  let format = Formatter({ colors: true })
  let output = format(eventMsgBotMsg)

  console.log(output)
  t.pass()
})
