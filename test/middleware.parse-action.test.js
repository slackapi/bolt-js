'use strict'

const test = require('ava').test
const sinon = require('sinon')
const fixtures = require('./fixtures/')
const ParseAction = require('../src/receiver/middleware/parse-action')

test('ParseAction()', t => {
  let mw = ParseAction()
  t.is(mw.length, 3)
})

test('ParseAction() no payload', t => {
  let mw = ParseAction().pop()

  let res = fixtures.getMockRes()
  let sendStub = sinon.stub(res, 'send')

  mw({ body: {} }, res, () => t.fail())
  t.true(sendStub.calledWith('Invalid request: payload missing'))
})

test('ParseAction() invalid json payload', t => {
  let mw = ParseAction().pop()

  let res = fixtures.getMockRes()
  let sendStub = sinon.stub(res, 'send')

  mw({ body: { payload: '\\{"' } }, res, () => t.fail())
  t.true(sendStub.calledWith('Error parsing payload'))
})

test.cb('ParseAction() valid payload', t => {
  t.plan(6)
  let mw = ParseAction().pop()

  let payload = mockPayload()
  let req = { body: { payload: JSON.stringify(payload) } }

  mw(req, fixtures.getMockRes(), () => {
    let slapp = req.slapp

    t.is(slapp.type, 'action')
    t.deepEqual(slapp.body, payload)
    t.is(slapp.meta.verify_token, payload.token)
    t.is(slapp.meta.user_id, payload.user.id)
    t.is(slapp.meta.channel_id, payload.channel.id)
    t.is(slapp.meta.team_id, payload.team.id)
    t.end()
  })
})

function mockPayload () {
  return {
    token: 'token',
    user: {
      id: 'user_id'
    },
    channel: {
      id: 'channel_id'
    },
    team: {
      id: 'team_id'
    }
  }
}
