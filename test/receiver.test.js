'use strict'

const test = require('ava').test
const sinon = require('sinon')
const fs = require('fs')
const fixtures = require('./fixtures/')
const Receiver = require('../src/receiver/')

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

  t.true(appStub.calledThrice)
  t.true(appStub.calledWith('/slack/event'))
  t.true(appStub.calledWith('/slack/command'))
  t.true(appStub.calledWith('/slack/action'))
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

  let logStub = sinon.stub(receiver.logfn, msg.type)
  let emitStub = sinon.stub(receiver, 'emit')
  let sendStub = sinon.stub(res, 'send')

  receiver.emitHandler({ slapp: msg }, res, () => t.fail())

  t.true(logStub.calledOnce)
  t.deepEqual(logStub.getCall(0).args[0], msg.body)
  t.true(emitStub.calledOnce)
  t.true(sendStub.calledOnce)
})

test('Receiver.emitHandler() w/o debug', t => {
  let receiver = new Receiver()
  let msg = getMockMessage()
  let res = fixtures.getMockRes()

  let logStub = sinon.stub(receiver.logfn, msg.type)
  let emitStub = sinon.stub(receiver, 'emit')
  let sendStub = sinon.stub(res, 'send')

  receiver.emitHandler({ slapp: msg }, res, () => t.fail())

  t.false(logStub.calledOnce)
  t.true(emitStub.calledOnce)
  t.true(sendStub.calledOnce)
})

test('Receiver.logCommand() no command', t => {
  let receiver = new Receiver()

  let logStub = sinon.stub(console, 'log')
  receiver.logCommand()

  t.true(logStub.calledWith('Command: UNKNOWN'))

  console.log.restore()
})

test('Receiver.logCommand() no command prop', t => {
  let receiver = new Receiver()
  let cmd = {}
  let logStub = sinon.stub(console, 'log')

  receiver.logCommand(cmd)

  t.true(logStub.calledWith('Command: Missing:', cmd))

  console.log.restore()
})

test('Receiver.logCommand()', t => {
  let receiver = new Receiver()
  let cmd = {
    command: 'beepboop',
    user_id: 'user_id',
    text: 'allthebots'
  }
  let logStub = sinon.stub(console, 'log')

  receiver.logCommand(cmd)

  let text = logStub.getCall(0).args[0]
  t.true(text.indexOf(cmd.command) >= 0)
  t.true(text.indexOf(cmd.user_id) >= 0)
  t.true(text.indexOf(cmd.text) >= 0)

  console.log.restore()
})

test('Receiver.logAction() no action', t => {
  let receiver = new Receiver()

  let logStub = sinon.stub(console, 'log')
  receiver.logAction()

  t.true(logStub.calledWith('Action: UNKNOWN'))

  console.log.restore()
})

test('Receiver.logAction()', t => {
  let receiver = new Receiver()
  let action = {
    'beep': 'boop'
  }
  let logStub = sinon.stub(console, 'log')

  receiver.logAction(action)

  t.true(logStub.calledWith('Action:', action))

  console.log.restore()
})

test('Receiver.logEvent() no event', t => {
  let receiver = new Receiver()

  let logStub = sinon.stub(console, 'log')
  receiver.logEvent()

  t.true(logStub.calledWith('Event: UNKNOWN'))

  console.log.restore()
})

test('Receiver.logEvent() no event prop', t => {
  let receiver = new Receiver()
  let event = {}
  let logStub = sinon.stub(console, 'log')
  receiver.logEvent(event)

  t.true(logStub.calledWith('Event: Missing:', event))

  console.log.restore()
})

test('Receiver.logEvent() unspecified type', t => {
  let receiver = new Receiver()
  let event = {
    event: {
      type: 'beepboop',
      user: 'user'
    }
  }
  let logStub = sinon.stub(console, 'log')
  receiver.logEvent(event)

  let text = logStub.getCall(0).args[0]
  t.true(text.indexOf(event.event.type) >= 0)
  t.true(text.indexOf(event.event.user) >= 0)

  console.log.restore()
})

test('Receiver.logEvent() reaction_added', t => {
  let receiver = new Receiver()
  let event = {
    event: {
      type: 'reaction_added',
      user: 'user',
      item: {
        type: 'item_type',
        channel: 'item_channel'
      },
      reaction: 'reaction'
    }
  }
  let logStub = sinon.stub(console, 'log')
  receiver.logEvent(event)

  let text = logStub.getCall(0).args[0]
  t.true(text.indexOf(event.event.type) >= 0)
  t.true(text.indexOf(event.event.user) >= 0)
  t.true(text.indexOf(event.event.item.type) >= 0)
  t.true(text.indexOf(event.event.item.channel) >= 0)
  t.true(text.indexOf(event.event.reaction) >= 0)

  console.log.restore()
})

test('Receiver.logEvent() message', t => {
  let receiver = new Receiver()
  let event = {
    event: {
      type: 'message',
      user: 'user',
      channel: 'channel',
      text: 'event text'
    }
  }
  let logStub = sinon.stub(console, 'log')
  receiver.logEvent(event)

  let text = logStub.getCall(0).args[0]
  t.true(text.indexOf(event.event.type) >= 0)
  t.true(text.indexOf(event.event.user) >= 0)
  t.true(text.indexOf(event.event.channel) >= 0)
  t.true(text.indexOf(event.event.text) >= 0)

  console.log.restore()
})

test('Receiver.logEvent() message w/ subtype', t => {
  let receiver = new Receiver()
  let event = {
    event: {
      type: 'message',
      subtype: 'sub-type',
      user: 'user',
      channel: 'channel',
      text: 'event text'
    }
  }
  let logStub = sinon.stub(console, 'log')
  receiver.logEvent(event)

  let text = logStub.getCall(0).args[0]
  t.true(text.indexOf(event.event.type) >= 0)
  t.true(text.indexOf(event.event.subtype) >= 0)
  t.true(text.indexOf(event.event.user) >= 0)
  t.true(text.indexOf(event.event.channel) >= 0)
  t.true(text.indexOf(event.event.text) >= 0)

  console.log.restore()
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
