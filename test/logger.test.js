'use strict'

const test = require('ava').test
const sinon = require('sinon')
const Logger = require('../src/logger')
const EventEmitter = require('events')

test('Logger()', t => {
  let app = new EventEmitter()

  Logger(app)

  t.is(app.listenerCount('info'), 1)
  t.is(app.listenerCount('error'), 1)
})

test('Logger() info', t => {
  let app = new EventEmitter()

  Logger(app)

  let logStub = sinon.stub(console, 'log')

  app.emit('info')

  let info = logStub.getCall(0).args[0]
  t.true(logStub.calledOnce)
  t.true(info.indexOf('slapp:info') >= 0)

  console.log.restore()
})

test('Logger() error', t => {
  let app = new EventEmitter()

  Logger(app)

  let logStub = sinon.stub(console, 'log')

  app.emit('error')

  let info = logStub.getCall(0).args[0]
  t.true(logStub.calledOnce)
  t.true(info.indexOf('slapp:error') >= 0)

  console.log.restore()
})
