'use strict'

const test = require('ava').test
const ParseCommand = require('../src/receiver/middleware/parse-command')
const fixtures = require('./fixtures/')

test('ParseCommand()', t => {
  let mw = ParseCommand()
  t.is(mw.length, 2)
})

test.cb('ParseCommand() no payload', t => {
  let mw = ParseCommand().pop()
  let req = { body: {} }

  mw(req, {}, () => {
    let slapp = req.slapp

    t.is(slapp.type, 'command')
    t.deepEqual(slapp.body, req.body)
    t.is(slapp.meta.verify_token, undefined)
    t.is(slapp.meta.user_id, undefined)
    t.is(slapp.meta.channel_id, undefined)
    t.is(slapp.meta.team_id, undefined)
    t.end()
  })
})

test.cb('ParseCommand() with payload', t => {
  let mw = ParseCommand().pop()
  let payload = mockPayload()
  let req = { body: payload }
  let res = fixtures.getMockRes()

  mw(req, res, () => {
    let slapp = req.slapp

    t.is(slapp.type, 'command')
    t.deepEqual(slapp.body, req.body)
    t.is(slapp.meta.verify_token, payload.token)
    t.is(slapp.meta.user_id, payload.user_id)
    t.is(slapp.meta.channel_id, payload.channel_id)
    t.is(slapp.meta.team_id, payload.team_id)
    t.is(slapp.response, res)
    t.is(slapp.responseTimeout, 2500)
    t.end()
  })
})

function mockPayload () {
  return {
    token: 'token',
    user_id: 'user_id',
    channel_id: 'channel_id',
    team_id: 'team_id'
  }
}
