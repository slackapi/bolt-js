'use strict'

const test = require('ava').test
const sinon = require('sinon')
const Logger = require('../src/logger')

test('Logger() w/ debug', t => {
  let logger = Logger(true)

  let logStub = sinon.stub(console, 'log')

  logger.debug('one')
  logger.error('two')

  t.true(logStub.calledTwice)

  let logArg = logStub.getCall(0).args[0]
  let errorArg = logStub.getCall(1).args[0]

  t.true(logArg.indexOf('debug:') >= 0)
  t.true(errorArg.indexOf('error:') >= 0)

  console.log.restore()
})

test('Logger() w/o debug', t => {
  let logger = Logger()

  let logStub = sinon.stub(console, 'log')

  logger.debug('one')
  logger.error('two')

  t.false(logStub.called)

  console.log.restore()
})
