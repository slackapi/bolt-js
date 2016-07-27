'use strict'

const test = require('ava').test
const ParseCommand = require('../src/receiver/middleware/parse-command')

test('ParseCommand()', t => {
  let mw = ParseCommand()
  t.is(mw.length, 2)
})

test.cb('ParseCommand() no payload', t => {
  let mw = ParseCommand().pop()
  let req = { body: {} }

  mw(req, {}, () => {
    let slackapp = req.slackapp

    t.is(slackapp.type, 'command')
    t.deepEqual(slackapp.body, req.body)
    t.is(slackapp.meta.verify_token, undefined)
    t.is(slackapp.meta.user_id, undefined)
    t.is(slackapp.meta.channel_id, undefined)
    t.is(slackapp.meta.team_id, undefined)
    t.end()
  })
})

test.cb('ParseCommand() with payload', t => {
  let mw = ParseCommand().pop()
  let payload = mockPayload()
  let req = { body: payload }

  mw(req, {}, () => {
    let slackapp = req.slackapp

    t.is(slackapp.type, 'command')
    t.deepEqual(slackapp.body, req.body)
    t.is(slackapp.meta.verify_token, payload.token)
    t.is(slackapp.meta.user_id, payload.user_id)
    t.is(slackapp.meta.channel_id, payload.channel_id)
    t.is(slackapp.meta.team_id, payload.team_id)
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
