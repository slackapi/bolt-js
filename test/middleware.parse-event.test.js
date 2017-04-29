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
    let slapp = req.slapp

    t.is(slapp.type, 'event')
    t.deepEqual(slapp.body, req.body)
    t.is(slapp.meta.verify_token, undefined)
    t.is(slapp.meta.user_id, undefined)
    t.is(slapp.meta.bot_id, undefined)
    t.is(slapp.meta.channel_id, undefined)
    t.is(slapp.meta.team_id, undefined)
    t.end()
  })
})

test.cb('ParseEvent() with payload', t => {
  let mw = ParseEvent().pop()
  let payload = mockPayload()
  let req = { body: payload }

  mw(req, {}, () => {
    let slapp = req.slapp

    t.is(slapp.type, 'event')
    t.deepEqual(slapp.body, req.body)
    t.is(slapp.meta.verify_token, payload.token)
    t.is(slapp.meta.user_id, payload.event.user)
    t.is(slapp.meta.bot_id, payload.event.bot_id)
    t.is(slapp.meta.channel_id, payload.event.channel)
    t.is(slapp.meta.team_id, payload.team_id)
    t.end()
  })
})

test.cb('ParseEvent() with user change payload', t => {
  let mw = ParseEvent().pop()
  let payload = mockUserChangePayload()
  let req = { body: payload }

  mw(req, {}, () => {
    let slapp = req.slapp

    t.is(slapp.type, 'event')
    t.deepEqual(slapp.body, req.body)
    t.is(slapp.meta.verify_token, payload.token)
    t.is(slapp.meta.user_id, payload.event.user.id)
    t.is(slapp.meta.bot_id, payload.event.bot_id)
    t.is(slapp.meta.channel_id, payload.event.channel)
    t.is(slapp.meta.team_id, payload.team_id)
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

function mockUserChangePayload () {
  return {
    token: 'token',
    event: {
      user: {
        id: 'user_id',
        team_id: 'team_id'
      },
      bot_id: 'bot_id',
      channel: 'channel_id'
    },
    team_id: 'team_id'
  }
}
