'use strict'

const test = require('ava').test
const sinon = require('sinon')
const fixtures = require('./fixtures/')
const LookupTokens = require('../src/receiver/middleware/lookup-tokens')

test.cb('LookupToken()', t => {
  t.plan(7)

  let mw = LookupTokens()
  let headers = fixtures.getMockHeaders()

  let req = fixtures.getMockReq({ headers })
  let res = fixtures.getMockRes()

  mw(req, res, () => {
    t.is(req.slapp.meta.app_token, headers['bb-slackaccesstoken'])
    t.is(req.slapp.meta.app_user_id, headers['bb-slackuserid'])
    t.is(req.slapp.meta.bot_token, headers['bb-slackbotaccesstoken'])
    t.is(req.slapp.meta.bot_user_id, headers['bb-slackbotuserid'])
    t.is(req.slapp.meta.bot_user_name, headers['bb-slackbotusername'])
    t.is(req.slapp.meta.team_name, headers['bb-slackteamname'])
    t.is(req.slapp.meta.team_domain, headers['bb-slackteamdomain'])
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

test('LookupToken() missing req.slapp', t => {
  let mw = LookupTokens()
  let headers = fixtures.getMockHeaders()

  let req = fixtures.getMockReq({ headers })
  let res = fixtures.getMockRes()

  delete req.slapp

  let sendStub = sinon.stub(res, 'send')

  mw(req, res, () => {
    t.fail()
  })

  t.true(sendStub.calledOnce)
})
