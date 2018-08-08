'use strict'

const test = require('ava').test
const sinon = require('sinon')
const fixtures = require('./fixtures/')
const ParseLoad = require('../src/receiver/middleware/parse-load')

const SIGNATURE = 'mysignature'
const TIMESTAMP = Date.now()

test('ParseLoad()', t => {
  let mw = ParseLoad()
  t.is(mw.length, 3)
})

test('ParseLoad() no payload', t => {
  let mw = ParseLoad().pop()

  let res = fixtures.getMockRes()
  let sendStub = sinon.stub(res, 'send')

  mw({ body: {} }, res, () => t.fail())
  t.true(sendStub.calledWith('Invalid request: payload missing'))
})

test('ParseLoad() invalid json payload', t => {
  let mw = ParseLoad().pop()

  let res = fixtures.getMockRes()
  let sendStub = sinon.stub(res, 'send')

  mw({ body: { payload: '\\{"' } }, res, () => t.fail())
  t.true(sendStub.calledWith('Error parsing payload'))
})

test.cb('ParseLoad() valid payload', t => {
  t.plan(10)
  let mw = ParseLoad().pop()

  let payload = mockPayload()
  let req = {
    body: { payload: JSON.stringify(payload) },
    headers: fixtures.getMockSlackHeaders(SIGNATURE, TIMESTAMP)
  }
  let res = fixtures.getMockRes()

  mw(req, res, () => {
    let slapp = req.slapp

    t.is(slapp.type, 'load')
    t.deepEqual(slapp.body, payload)
    t.is(slapp.meta.verify_token, payload.token)
    t.is(slapp.meta.user_id, payload.user.id)
    t.is(slapp.meta.channel_id, payload.channel.id)
    t.is(slapp.meta.team_id, payload.team.id)
    t.is(slapp.meta.signature, SIGNATURE)
    t.is(slapp.meta.timestamp, TIMESTAMP)
    t.is(slapp.response, res)
    t.is(slapp.responseTimeout, 3000)

    t.end()
  })
})

test.cb('ParseLoad() valid payload - no headers', t => {
  t.plan(10)
  let mw = ParseLoad().pop()

  let payload = mockPayload()
  let req = {
    body: { payload: JSON.stringify(payload) }
  }
  let res = fixtures.getMockRes()

  mw(req, res, () => {
    let slapp = req.slapp

    t.is(slapp.type, 'load')
    t.deepEqual(slapp.body, payload)
    t.is(slapp.meta.verify_token, payload.token)
    t.is(slapp.meta.user_id, payload.user.id)
    t.is(slapp.meta.channel_id, payload.channel.id)
    t.is(slapp.meta.team_id, payload.team.id)
    t.is(slapp.meta.signature, undefined)
    t.is(slapp.meta.timestamp, undefined)
    t.is(slapp.response, res)
    t.is(slapp.responseTimeout, 3000)

    t.end()
  })
})

function mockPayload () {
  return {
    token: 'token',
    type: 'dialog_suggestion',
    user: {
      id: 'user_id'
    },
    channel: {
      id: 'channel_id'
    },
    team: {
      id: 'team_id'
    },
    name: 'appetizer',
    callback_id: 'menu_selection'
  }
}
