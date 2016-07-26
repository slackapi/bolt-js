'use strict'

const test = require('ava').test
const sinon = require('sinon')
const fixtures = require('./fixtures/')
const LookupTokens = require('../src/receiver/middleware/lookup-tokens')

test.cb('LookupToken()', t => {
  t.plan(4)

  let mw = LookupTokens()
  let headers = fixtures.getMockHeaders()

  let req = fixtures.getMockReq({ headers })
  let res = fixtures.getMockRes()

  mw(req, res, () => {
    t.is(req.slackapp.meta.app_token, headers['bb-slackaccesstoken'])
    t.is(req.slackapp.meta.app_user_id, headers['bb-slackuserid'])
    t.is(req.slackapp.meta.bot_token, headers['bb-slackbotaccesstoken'])
    t.is(req.slackapp.meta.bot_user_id, headers['bb-slackbotuserid'])
    t.end()
  })
})

test('LookupToken() error header', t => {
  let mw = LookupTokens()
  let headers = fixtures.getMockHeaders({
    'bb-error': 'kaboom'
  })

  let req = fixtures.getMockReq({ headers })
  let res = fixtures.getMockRes()

  let sendStub = sinon.stub(res, 'send')

  mw(req, res, () => {
    t.fail()
  })

  t.true(sendStub.calledOnce)
})

test('LookupToken() missing req.slackapp', t => {
  let mw = LookupTokens()
  let headers = fixtures.getMockHeaders()

  let req = fixtures.getMockReq({ headers })
  let res = fixtures.getMockRes()

  delete req.slackapp

  let sendStub = sinon.stub(res, 'send')

  mw(req, res, () => {
    t.fail()
  })

  t.true(sendStub.calledOnce)
})
