'use strict'

const test = require('ava').test
const sinon = require('sinon')
const fixtures = require('./fixtures/')
const VerifyToken = require('../src/receiver/middleware/verify-token')

test.cb('VerifyToken() no token option', t => {
  let mw = VerifyToken()

  mw(fixtures.getMockReq(), fixtures.getMockRes(), () => {
    t.pass()
    t.end()
  })
})

test('VerifyToken() token option no verify_token', t => {
  let mw = VerifyToken('beepboop')
  let res = fixtures.getMockRes()

  let statusStub = sinon.stub(res, 'status', () => { return res })
  let sendStub = sinon.stub(res, 'send')

  mw(fixtures.getMockReq(), res, () => {})
  t.true(statusStub.calledWith(403))
  t.true(sendStub.calledWith('Invalid verify token'))
})

test.cb('VerifyToken() token option matching verify_token', t => {
  let token = 'beepboop'
  let mw = VerifyToken(token)
  let req = fixtures.getMockReq({
    slapp: {
      meta: {
        verify_token: token
      }
    }
  })
  let res = fixtures.getMockRes()

  mw(req, res, () => {
    t.pass()
    t.end()
  })
})

test('VerifyToken() token option nonmatching verify_token', t => {
  let token = 'beepboop'
  let onError = sinon.stub()
  let mw = VerifyToken(token, onError)
  let req = fixtures.getMockReq({
    slapp: {
      meta: {
        verify_token: 'derp'
      }
    }
  })
  let res = fixtures.getMockRes()

  let statusStub = sinon.stub(res, 'status', () => { return res })
  let sendStub = sinon.stub(res, 'send')

  mw(req, res, () => {})
  t.true(statusStub.calledWith(403))
  t.true(sendStub.calledWith('Invalid verify token'))
  t.true(onError.calledWith('Invalid verify token'))
})
