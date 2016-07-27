'use strict'

const test = require('ava').test
const sinon = require('sinon')
const fixtures = require('./fixtures/')
const SSLCheck = require('../src/receiver/middleware/ssl-check')

test.cb('SSLCheck() no ssl_check', t => {
  let mw = SSLCheck()
  mw({ body: {} }, {}, () => {
    t.pass()
    t.end()
  })
})

test('SSLCheck() no ssl_check', t => {
  let mw = SSLCheck()
  let res = fixtures.getMockRes()

  let sendStub = sinon.stub(res, 'send')

  mw({ body: { ssl_check: true } }, res, () => {})
  t.true(sendStub.calledOnce)
})
