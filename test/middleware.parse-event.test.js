'use strict'

const test = require('ava').test
const sinon = require('sinon')
const fixtures = require('./fixtures/')
const ParseEvent = require('../src/receiver/middleware/parse-event')

test('ParseEvent()', t => {
  let mw = ParseEvent()
  t.is(mw.length, 3)
})

test.cb('ParseEvent() no payload', t => {
  let mw = ParseEvent().pop()
  let req = { body: {} }

  mw(req, {}, () => {
    let slackapp = req.slackapp

    t.is(slackapp.type, 'event')
    t.deepEqual(slackapp.body, req.body)
    t.is(slackapp.meta.verify_token, undefined)
    t.is(slackapp.meta.user_id, undefined)
    t.is(slackapp.meta.bot_id, undefined)
    t.is(slackapp.meta.channel_id, undefined)
    t.is(slackapp.meta.team_id, undefined)
    t.end()
  })
})

test.cb('ParseEvent() with payload', t => {
  let mw = ParseEvent().pop()
  let payload = mockPayload()
  let req = { body: payload }

  mw(req, {}, () => {
    let slackapp = req.slackapp

    t.is(slackapp.type, 'event')
    t.deepEqual(slackapp.body, req.body)
    t.is(slackapp.meta.verify_token, payload.token)
    t.is(slackapp.meta.user_id, payload.event.user)
    t.is(slackapp.meta.bot_id, payload.event.bot_id)
    t.is(slackapp.meta.channel_id, payload.event.channel)
    t.is(slackapp.meta.team_id, payload.team_id)
    t.end()
  })
})

test('ParseEvent() challenge request', t => {
  let mw = ParseEvent()[1]

  let req = { body: { challenge: 'challenge' } }
  let res = fixtures.getMockRes()
  let sendStub = sinon.stub(res, 'send')

  mw(req, res, () => t.fail())
  t.true(sendStub.calledWith({ challenge: req.body.challenge }))
})

test.cb('ParseEvent() non-challenge request', t => {
  let mw = ParseEvent()[1]

  mw({}, {}, () => {
    t.pass()
    t.end()
  })
})

function mockPayload () {
  return {
    token: 'token',
    event: {
      user: 'user_id',
      bot_id: 'bot_id',
      channel: 'channel_id'
    },
    team_id: 'team_id'
  }
}
