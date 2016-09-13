'use strict'

const test = require('ava').test
const sinon = require('sinon')
const slack = require('slack')
const EventEmitter = require('events')
const Message = require('../src/message')

test('Message() w/ user_id', t => {
  let type = 'event'
  let body = {
    text: 'beepboop'
  }
  let meta = {
    team_id: 'team_id',
    channel_id: 'channel_id',
    user_id: 'user_id',
    bot_id: 'bot_id'
  }
  let msg = new Message(type, body, meta)

  t.is(msg.type, type)
  t.deepEqual(msg.body, body)
  t.deepEqual(msg.meta, meta)
  t.is(msg._slapp, null)
  t.is(msg.conversation_id, 'team_id::channel_id::user_id')
})

test('Message() w/o user_id', t => {
  let type = 'event'
  let body = {
    text: 'beepboop'
  }
  let meta = {
    team_id: 'team_id',
    channel_id: 'channel_id',
    bot_id: 'bot_id'
  }
  let msg = new Message(type, body, meta)

  t.is(msg.type, type)
  t.deepEqual(msg.body, body)
  t.deepEqual(msg.meta, meta)
  t.is(msg._slapp, null)
  t.is(msg.conversation_id, 'team_id::channel_id::bot_id')
})

test('Message() w/o user_id, bot_id, or channel_id', t => {
  let type = 'event'
  let body = {
    text: 'beepboop'
  }
  let meta = {
    app_token: 'asdf',
    team_id: 'team_id'
  }
  let msg = new Message(type, body, meta)
  let err = msg.verifyProps()

  t.is(err, null)
  t.is(msg.type, type)
  t.deepEqual(msg.body, body)
  t.deepEqual(msg.meta, meta)
  t.is(msg._slapp, null)
  t.is(msg.conversation_id, 'team_id::nochannel::nouser')
})

test('Message() defaults', t => {
  let msg = new Message()

  t.is(msg.type, undefined)
  t.is(msg._slapp, null)
  t.deepEqual(msg.body, {})
  t.deepEqual(msg.meta, {})
})

test('Message.attachOverrideRoute()', t => {
  t.plan(3)

  let msg = new Message()
  let state = {
    beep: 'boop'
  }
  let app = {
    getRoute: () => {}
  }
  let overrideFn = (msg2, state2) => {
    t.is(msg2, msg)
    t.is(state2, state)
  }
  let appStub = sinon.stub(app, 'getRoute', () => {
    return overrideFn
  })

  msg._slapp = app
  msg.attachOverrideRoute('key', state)
  msg.override(msg)

  t.true(appStub.calledOnce)
})

test('Message.route()', t => {
  t.plan(6)

  let msg = new Message()
  msg.conversation_id = 'beepboop'
  let fnKey = 'next:route'
  let state = {
    beep: 'boop'
  }
  let app = {
    convoStore: {
      set: () => {}
    }
  }
  let setStub = sinon.stub(app.convoStore, 'set', (key, data) => {
    t.is(key, msg.conversation_id)
    t.is(data.fnKey, fnKey)
    t.is(data.state, state)
    t.is(typeof data.expiration, 'number')
    t.true(data.expiration > Date.now())
  })

  msg._slapp = app
  msg.route(fnKey, state, 60)
  t.true(setStub.calledOnce)
})

test('Message.route() defaults', t => {
  t.plan(6)

  let msg = new Message()
  msg.conversation_id = 'beepboop'
  let fnKey = 'next:route'
  let app = {
    convoStore: {
      set: () => {}
    }
  }
  let setStub = sinon.stub(app.convoStore, 'set', (key, data) => {
    t.is(key, msg.conversation_id)
    t.is(data.fnKey, fnKey)
    t.deepEqual(data.state, {})
    t.is(typeof data.expiration, 'number')
    t.true(data.expiration > Date.now())
  })

  msg._slapp = app
  msg.route(fnKey)
  t.true(setStub.calledOnce)
})

test('Message.route() w/ convoStore.set error', t => {
  t.plan(2)

  let msg = new Message()
  msg.conversation_id = 'beepboop'
  let fnKey = 'next:route'
  let state = {
    beep: 'boop'
  }
  let app = {
    emit: () => {},
    convoStore: {
      set: () => {}
    }
  }
  let setStub = sinon.stub(app.convoStore, 'set', (key, data, done) => {
    done('boom')
  })
  let emitSpy = sinon.spy(app, 'emit')

  msg._slapp = app
  msg.route(fnKey, state, 60)
  t.true(setStub.calledOnce)
  t.true(emitSpy.calledWith('error', 'boom'))
})

test('Message.cancel()', t => {
  t.plan(2)

  let msg = new Message()
  msg.conversation_id = 'beepboop'
  let app = {
    convoStore: {
      del: () => {}
    }
  }
  let delStub = sinon.stub(app.convoStore, 'del', (convoId) => {
    t.is(convoId, msg.conversation_id)
  })

  msg._slapp = app
  msg.cancel()
  t.true(delStub.calledOnce)
})

test('Message.say() w/ string using bot_token', t => {
  t.plan(4)

  let meta = {
    bot_token: 'bot_token',
    app_token: 'app_token',
    channel_id: 'channel_id'
  }
  let msg = new Message('event', {}, meta)
  let input = 'beepboop'
  let postStub = sinon.stub(slack.chat, 'postMessage', (payload) => {
    t.is(payload.text, input)
    t.is(payload.token, meta.bot_token)
    t.is(payload.channel, meta.channel_id)
  })

  msg.say(input)

  t.true(postStub.calledOnce)
  slack.chat.postMessage.restore()
})

test('Message.say() w/ callback', t => {
  t.plan(6)

  let meta = {
    bot_token: 'bot_token',
    app_token: 'app_token',
    channel_id: 'channel_id'
  }
  let msg = new Message('event', {}, meta)
  let input = 'beepboop'
  let result = { data: 'data' }
  let postStub = sinon.stub(slack.chat, 'postMessage', (payload, callback) => {
    t.is(payload.text, input)
    t.is(payload.token, meta.bot_token)
    t.is(payload.channel, meta.channel_id)
    callback(null, result)
  })

  msg.say(input, (err, data) => {
    t.is(err, null)
    t.is(data, result)
  })

  t.true(postStub.calledOnce)
  slack.chat.postMessage.restore()
})

test('Message.say() w/ string using app_token', t => {
  t.plan(4)

  let meta = {
    app_token: 'app_token',
    channel_id: 'channel_id'
  }
  let msg = new Message('event', {}, meta)
  let input = 'beepboop'
  let postStub = sinon.stub(slack.chat, 'postMessage', (payload) => {
    t.is(payload.text, input)
    t.is(payload.token, meta.app_token)
    t.is(payload.channel, meta.channel_id)
  })

  msg.say(input)

  t.true(postStub.calledOnce)
  slack.chat.postMessage.restore()
})

test('Message.say() w/ object override token & channel', t => {
  t.plan(4)

  let meta = {
    app_token: 'app_token',
    channel_id: 'channel_id'
  }
  let msg = new Message('event', {}, meta)
  let input = {
    text: 'beepboop',
    channel: 'override_channel',
    token: 'override_token'
  }
  let postStub = sinon.stub(slack.chat, 'postMessage', (payload) => {
    t.is(payload.text, input.text)
    t.is(payload.token, input.token)
    t.is(payload.channel, input.channel)
  })

  msg.say(input)

  t.true(postStub.calledOnce)
  slack.chat.postMessage.restore()
})

test.cb('Message.say() multiple in series', t => {
  t.plan(2)

  let meta = {
    bot_token: 'bot_token',
    app_token: 'app_token',
    channel_id: 'channel_id'
  }
  let msg = new Message('event', {}, meta)
  let expected = '012345678910111213141516171819'
  let accumulated = ''
  let postStub = sinon.stub(slack.chat, 'postMessage', (payload, callback) => {
    setTimeout(() => {
      callback()
      accumulated += payload.text
      if (accumulated.length === 30) {
        t.is(expected, accumulated)
        t.is(postStub.callCount, 20)
        slack.chat.postMessage.restore()
        t.end()
      }
    }, Math.floor(Math.random() * 5))
  })

  for (let i = 0; i < 20; i++) {
    msg.say(String(i))
  }
})

test('Message.say() api error', t => {
  t.plan(5)

  let meta = {
    app_token: 'app_token',
    channel_id: 'channel_id'
  }
  let msg = new Message('event', {}, meta)
  let slapp = new EventEmitter()
  msg.attachSlapp(slapp)
  let input = 'beepboop'
  let postStub = sinon.stub(slack.chat, 'postMessage', (payload, done) => {
    t.is(payload.text, input)
    t.is(payload.token, meta.app_token)
    t.is(payload.channel, meta.channel_id)

    // simulate an error in the api call
    done('kaboom')
  })
  let emitStub = sinon.stub(slapp, 'emit')

  msg.say(input)

  t.true(postStub.calledOnce)
  t.true(emitStub.calledWith('error', 'kaboom'))

  slack.chat.postMessage.restore()
})

test.cb('Message.respond()', t => {
  t.plan(5)

  let msg = new Message()
  let url = 'http://beepboophq.com'
  let input = 'beepboop'

  let reqStub = sinon.stub(msg, '_request', (responseUrl, input, cb) => {
    t.is(responseUrl, url)
    t.is(input, input)

    cb(null, {}, { ok: true })
  })

  msg.respond(url, input, (err, body) => {
    t.true(reqStub.calledOnce)
    t.is(err, null)
    t.is(body.ok, undefined)
    t.end()
  })
})

test.cb('Message.respond() w/ error', t => {
  t.plan(5)

  let slapp = new EventEmitter()
  let msg = new Message()
  msg.attachSlapp(slapp)
  let url = 'http://beepboophq.com'
  let input = 'beepboop'

  let reqStub = sinon.stub(msg, '_request', (responseUrl, input, cb) => {
    t.is(responseUrl, url)
    t.is(input, input)

    cb(new Error('kaboom'))
  })
  let emitStub = sinon.stub(slapp, 'emit')

  msg.respond(url, input, (err, body) => {
    t.true(reqStub.calledOnce)
    t.is(err.message, 'kaboom')
    t.true(emitStub.calledWith('error'))
    t.end()
  })
})

test.cb('Message.respond() w/ body.error', t => {
  t.plan(5)

  let slapp = new EventEmitter()
  let msg = new Message()
  msg.attachSlapp(slapp)
  let url = 'http://beepboophq.com'
  let input = 'beepboop'

  let reqStub = sinon.stub(msg, '_request', (responseUrl, input, cb) => {
    t.is(responseUrl, url)
    t.is(input, input)

    cb(null, {}, { error: 'kaboom' })
  })
  let emitStub = sinon.stub(slapp, 'emit')

  msg.respond(url, input, (err, body) => {
    t.true(reqStub.calledOnce)
    t.is(err.message, 'kaboom')
    t.true(emitStub.calledWith('error'))
    t.end()
  })
})

test.cb('Message.respond() w/ rate_limit error', t => {
  t.plan(5)

  let slapp = new EventEmitter()
  let msg = new Message()
  msg.attachSlapp(slapp)
  let url = 'http://beepboophq.com'
  let input = 'beepboop'

  let reqStub = sinon.stub(msg, '_request', (responseUrl, input, cb) => {
    t.is(responseUrl, url)
    t.is(input, input)

    cb(null, {}, 'You are sending too many requests. Please relax.')
  })
  let emitStub = sinon.stub(slapp, 'emit')

  msg.respond(url, input, (err, body) => {
    t.true(reqStub.calledOnce)
    t.is(err.message, 'rate_limit')
    t.true(emitStub.calledWith('error'))
    t.end()
  })
})

test('Message.respond() w/o callback', t => {
  let msg = new Message()
  let url = 'http://beepboophq.com'
  let input = 'beepboop'

  let reqStub = sinon.stub(msg, '_request', (responseUrl, input, cb) => {
    t.is(responseUrl, url)
    t.is(input, input)

    cb(null, {}, { ok: true })
  })

  msg.respond(url, input)
  t.true(reqStub.calledOnce)
})

test('Message.respond() w/o responseUrl', t => {
  let msg = new Message()
  let url = 'https://slack'
  let input = 'beepboop'

  msg.body.response_url = url

  let reqStub = sinon.stub(msg, '_request', (responseUrl, input, cb) => {
    t.is(responseUrl, url)
    t.is(input, input)

    cb(null, {}, { ok: true })
  })

  msg.respond(input)
  t.true(reqStub.calledOnce)
})

test('Message.respond() w/o responseUrl and response_url missing from body', t => {
  t.plan(2)
  let msg = new Message()
  let input = 'beepboop'

  msg.respond(input, (err) => {
    t.truthy(err)
    t.is(err.message, 'responseUrl not provided or not included as response_url with this type of Slack event')
  })
})

test.cb('Message.respond() multiple in series', t => {
  t.plan(2)
  let msg = new Message()
  let url = 'https://slack'

  msg.body.response_url = url

  let expected = '012345678910111213141516171819'
  let accumulated = ''
  let reqStub = sinon.stub(msg, '_request', (responseUrl, input, cb) => {
    setTimeout(() => {
      cb(null, {}, { ok: true })
      accumulated += input.text
      if (accumulated.length === 30) {
        t.is(expected, accumulated)
        t.is(reqStub.callCount, 20)
        msg._request.restore()
        t.end()
      }
    }, Math.floor(Math.random() * 5))
  })

  for (let i = 0; i < 20; i++) {
    msg.respond(String(i))
  }
})

test('Message.isBot() w/ bot_id', t => {
  let msg = new Message('event', {}, {
    bot_id: 'bot_id'
  })
  t.true(msg.isBot())
})

test('Message.isBot() w/o any ids', t => {
  let msg = new Message('event', {}, {})
  t.false(msg.isBot())
})

test('Message.isBot() w/o matching user_id and bot_user_id', t => {
  let msg = new Message('event', {}, {
    user_id: 'asdf',
    bot_user_id: 'fdsa'
  })
  t.false(msg.isBot())
})

test('Message.isBot() w/ matching user_id and bot_user_id', t => {
  let msg = new Message('event', {}, {
    user_id: 'asdf',
    bot_user_id: 'asdf'
  })
  t.true(msg.isBot())
})

test('Message.isBot() w/ bot_id and matching user_id and bot_user_id', t => {
  let msg = new Message('event', {}, {
    bot_id: 'bot_id',
    user_id: 'asdf',
    bot_user_id: 'asdf'
  })
  t.true(msg.isBot())
})

test('Message.isMessage()', t => {
  let msg = new Message('event', {
    event: {
      type: 'message'
    }
  })
  t.true(msg.isMessage())
})

test('Message.isMessage() wrong type', t => {
  let msg = new Message('command', {
    event: {
      type: 'message'
    }
  })
  t.false(msg.isMessage())
})

test('Message.isMessage() no event', t => {
  let msg = new Message('event')
  t.false(msg.isMessage())
})

test('Message.isMessage() no event type', t => {
  let msg = new Message('event', {
    event: {}
  })
  t.false(msg.isMessage())
})

test('Message.isMessage() wrong event.type', t => {
  let msg = new Message('event', {
    event: {
      type: 'action'
    }
  })
  t.false(msg.isMessage())
})

test('Message.isDirectMention() true', t => {
  let botUserId = 'bot_user_id'
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: `<@${botUserId}>: how you doing?`
    }
  }, {
    bot_user_id: botUserId
  })

  t.true(msg.isDirectMention())
})

test('Message.isDirectMention() false', t => {
  let botUserId = 'bot_user_id'
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: `hey <@${botUserId}>: how you doing?`
    }
  }, {
    bot_user_id: botUserId
  })

  t.false(msg.isDirectMention())
})

test('Message.stripDirectMention()', t => {
  let botUserId = 'bot_user_id'
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: `<@${botUserId}>: how you doing?`
    }
  }, {
    bot_user_id: botUserId
  })

  t.is(msg.stripDirectMention(), 'how you doing?')
})

test('Message.stripDirectMention() w/ undefined text', t => {
  let botUserId = 'bot_user_id'
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: undefined
    }
  }, {
    bot_user_id: botUserId
  })

  t.is(msg.stripDirectMention(), '')
})

test('Message._processInput() with array', t => {
  let msg = new Message()
  let vals = ['one', 'two', 'three']
  let input = msg._processInput(vals)

  t.is(typeof input, 'object')
  t.true(vals.indexOf(input.text) >= 0)
})

test('Message.usersMentioned()', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'hi <@U1> do you know <@U2>?'
    }
  })

  let users = msg.usersMentioned()
  t.deepEqual(users, ['U1', 'U2'])
})

test('Message.usersMentioned() no users', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'hi'
    }
  })

  let users = msg.usersMentioned()
  t.deepEqual(users, [])
})

test('Message.channelsMentioned()', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'hi <#C1> do you know <#C2>?'
    }
  })

  let channels = msg.channelsMentioned()
  t.deepEqual(channels, ['C1', 'C2'])
})

test('Message.channelsMentioned() no channels', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'hi'
    }
  })

  let channels = msg.channelsMentioned()
  t.deepEqual(channels, [])
})

test('Message.subteamGroupsMentioned()', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'hi <!subteam^S1|team1> do you know <!subteam^S2|team2> <#C1> <@U1>?'
    }
  })

  let subteams = msg.subteamGroupsMentioned()
  t.deepEqual(subteams, ['S1', 'S2'])
})

test('Message.subteamGroupsMentioned() no subteams', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'hi'
    }
  })

  let subteams = msg.subteamGroupsMentioned()
  t.deepEqual(subteams, [])
})

test('Message.everyoneMentioned() true', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'hi <!everyone> how are you?'
    }
  })

  t.true(msg.everyoneMentioned())
})

test('Message.everyoneMentioned() false', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'hi <!everyones> how are you?'
    }
  })

  t.false(msg.everyoneMentioned())
})

test('Message.channelMentioned() true', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'hi <!channel>!'
    }
  })

  t.true(msg.channelMentioned())
})

test('Message.channelMentioned() false', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'hi everyone'
    }
  })

  t.false(msg.channelMentioned())
})

test('Message.hereMentioned() true', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'hi <!here>!'
    }
  })

  t.true(msg.hereMentioned())
})

test('Message.hereMentioned() false', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'hi here'
    }
  })

  t.false(msg.hereMentioned())
})

test('Message.linksMentioned()', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'some links <https://beepboophq.com|beepboop> <http://google.com>'
    }
  })

  let links = msg.linksMentioned()
  t.deepEqual(links, ['https://beepboophq.com', 'http://google.com'])
})

test('Message.linksMentioned() no links', t => {
  let msg = new Message('event', {
    event: {
      type: 'message',
      text: 'hi'
    }
  })

  let links = msg.linksMentioned()
  t.deepEqual(links, [])
})
