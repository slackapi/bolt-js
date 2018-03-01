'use strict'

const test = require('ava').test
const sinon = require('sinon')
const ParseOptions = require('../src/receiver/middleware/parse-options')
const fixtures = require('./fixtures/')

test('ParseOptions()', t => {
  let mw = ParseOptions()
  t.is(mw.length, 2)
})

test('ParseOptions() no payload', t => {
  let mw = ParseOptions().pop()

  let res = fixtures.getMockRes()
  let sendStub = sinon.stub(res, 'send')

  mw({ body: {} }, res, () => t.fail())
  t.true(sendStub.calledWith('Invalid request: payload missing'))
})

test('ParseOptions() unparsable payload', t => {
  let mw = ParseOptions().pop()

  let res = fixtures.getMockRes()
  let sendStub = sinon.stub(res, 'send')

  mw({ body: { payload: '\\{"' } }, res, () => t.fail())
  t.true(sendStub.calledWith('Error parsing payload'))
})

test.cb('ParseOptions() with payload', t => {
  let mw = ParseOptions().pop()
  let payload = mockPayload()
  let req = { body: { payload: JSON.stringify(payload) } }
  let res = fixtures.getMockRes()

  mw(req, res, (err) => {
    t.ifError(err)
    let slapp = req.slapp

    t.is(slapp.type, 'options')
    t.deepEqual(slapp.body, payload)
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
