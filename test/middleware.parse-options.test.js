'use strict'

const test = require('ava').test
const ParseOptions = require('../src/receiver/middleware/parse-options')
const fixtures = require('./fixtures/')

test('ParseOptions()', t => {
  let mw = ParseOptions()
  t.is(mw.length, 2)
})

test.cb('ParseOptions() no payload', t => {
  let mw = ParseOptions().pop()
  let req = { body: {} }

  mw(req, {}, () => {
    let slapp = req.slapp

    t.is(slapp.type, 'options')
    t.deepEqual(slapp.body, req.body)
    t.is(slapp.meta.verify_token, undefined)
    t.is(slapp.meta.user_id, undefined)
    t.is(slapp.meta.channel_id, undefined)
    t.is(slapp.meta.team_id, undefined)
    t.end()
  })
})

test.cb('ParseOptions() with payload', t => {
  let mw = ParseOptions().pop()
  let payload = mockPayload()
  let req = { body: payload }
  let res = fixtures.getMockRes()

  mw(req, res, () => {
    let slapp = req.slapp

    t.is(slapp.type, 'options')
    t.deepEqual(slapp.body, req.body)
    t.is(slapp.meta.verify_token, payload.token)
    t.is(slapp.meta.user_id, payload.user.id)
    t.is(slapp.meta.channel_id, payload.channel.id)
    t.is(slapp.meta.team_id, payload.team.id)
    t.is(slapp.response, res)
    t.is(slapp.responseTimeout, 3000)
    t.end()
  })
})

function mockPayload () {
  return {
    name: 'name',
    value: '',
    callback_id: 'callback_id',
    team: {
      id: 'team_id',
      domain: 'team_domain'
    },
    channel: {
      id: 'channel_id',
      name: 'channel_name'
    },
    user: {
      id: 'user_id',
      name: 'user_name'
    },
    action_ts: 'action_ts',
    message_ts: 'message_ts',
    attachment_id: '1',
    token: 'token'
  }
}
