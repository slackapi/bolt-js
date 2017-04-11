'use strict'

const test = require('ava').test
const sinon = require('sinon')
const fs = require('fs')
const fixtures = require('./fixtures/')
const Receiver = require('../src/receiver/')
const Message = require('../src/message')

test('Receiver() w/ record', t => {
  let writeStub = sinon.stub(fs, 'writeFileSync', () => {})
  let appendStub = sinon.stub(fs, 'appendFile', () => {})

  let receiver = new Receiver({
    record: 'slack-events.log'
  })

  t.true(writeStub.calledOnce)

  receiver.emit('message', {})

  t.true(appendStub.calledOnce)
  fs.writeFileSync.restore()
  fs.appendFile.restore()
})

test('Receiver.attachToExpress() defaults', t => {
  let receiver = new Receiver()

  let app = {
    post: () => {}
  }
  let appStub = sinon.stub(app, 'post')

  receiver.attachToExpress(app)

  t.is(appStub.callCount, 4)
  t.true(appStub.calledWith('/slack/event'))
  t.true(appStub.calledWith('/slack/command'))
  t.true(appStub.calledWith('/slack/action'))
  t.true(appStub.calledWith('/slack/options'))
})

test('Receiver.attachToExpress() true, false, string', t => {
  let receiver = new Receiver()
  let actionRoute = '/slack-action'

  let app = {
    post: () => {}
  }
  let appStub = sinon.stub(app, 'post')

  receiver.attachToExpress(app, {
    event: true,
    command: false,
    action: actionRoute
  })

  t.true(appStub.calledTwice)
  t.true(appStub.calledWith('/slack/event'))
  t.true(appStub.calledWith(actionRoute))
})

test('Receiver.emitHandler() no req.slapp', t => {
  let receiver = new Receiver()

  let res = fixtures.getMockRes()
  let sendStub = sinon.stub(res, 'send')

  receiver.emitHandler({}, res, () => t.fail())
  t.true(sendStub.calledWith('Missing req.slapp'))
})

test('Receiver.emitHandler() w/ debug', t => {
  let receiver = new Receiver({
    debug: true
  })
  let msg = getMockMessage()
  let res = fixtures.getMockRes()

  let emitStub = sinon.stub(receiver, 'emit')
  let sendStub = sinon.stub(res, 'send')

  receiver.emitHandler({ slapp: msg }, res, () => t.fail())

  t.true(emitStub.calledOnce)
  t.true(sendStub.calledOnce)
})

test('Receiver.emitHandler() w/o debug', t => {
  let receiver = new Receiver()
  let msg = getMockMessage()
  let res = fixtures.getMockRes()

  let emitStub = sinon.stub(receiver, 'emit')
  let sendStub = sinon.stub(res, 'send')

  receiver.emitHandler({ slapp: msg }, res, () => t.fail())

  t.true(emitStub.calledOnce)
  t.true(sendStub.calledOnce)
})

test('Receiver.emitHandler() attachResponse', t => {
  let receiver = new Receiver()
  let msg = getMockMessage()
  let res = fixtures.getMockRes()

  msg.response = res
  msg.responseTimeout = 100

  let emitStub = sinon.stub(receiver, 'emit')
  let sendStub = sinon.stub(res, 'send')
  let attachStub = sinon.stub(receiver, 'attachResponse')

  receiver.emitHandler({ slapp: msg }, res, () => t.fail())
  t.true(emitStub.calledOnce)
  t.true(sendStub.notCalled)
  t.true(attachStub.calledOnce)
})

test('Receiver.attachResponse()', t => {
  let receiver = new Receiver()
  let res = fixtures.getMockRes()
  let msg = new Message()
  let attachStub = sinon.stub(msg, 'attachResponse')

  receiver.attachResponse(msg, res, 100)
  t.true(attachStub.calledOnce)
})

function getMockMessage () {
  return {
    type: 'event',
    body: {
      token: 'token',
      event: {
        user: 'user_id',
        bot_id: 'bot_id',
        channel: 'channel_id'
      },
      team_id: 'team_id'
    },
    meta: {
      verify_token: 'verify_token',
      user_id: 'user_id',
      bot_id: 'bot_id',
      channel_id: 'channel_id',
      team_id: 'team_id'
    }
  }
}
