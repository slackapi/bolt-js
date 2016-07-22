'use strict'

const test = require('ava').test
const sinon = require('sinon')
const SlackApp = require('../src/slackapp')

test('SlackApp()', t => {
  let options = {
    app_token: 'token',
    app_user_id: 'app_user_id',
    bot_token: 'bot_token',
    bot_user_id: 'bot_user_id',
    debug: true,
    convo_store: () => {},
    error: () => {}
  }

  let app = new SlackApp(options)

  t.is(app.app_token, options.app_token)
  t.is(app.app_user_id, options.app_user_id)
  t.is(app.bot_token, options.bot_token)
  t.is(app.bot_user_id, options.bot_user_id)
  t.is(app.debug, options.debug)
  t.is(app.convoStore, options.convo_store)
  t.is(app.onError, options.error)
  t.is(typeof app.client, 'object')
  t.is(typeof app.receiver, 'object')
  t.true(Array.isArray(app._middleware))
  t.is(app._middleware.length, 0)
})

test('Slackapp.use()', t => {
  let mw = () => {}
  let app = new SlackApp()

  t.is(app._middleware.length, 0)

  app.use(mw)

  t.is(app._middleware.length, 1)
  t.deepEqual(app._middleware, [mw])
})

test('Slackapp.attachToExpress()', t => {
  let app = new SlackApp()
  let stub = sinon.stub(app.receiver, 'attachToExpress')

  app.attachToExpress({})

  t.true(stub.calledOnce)
})

test('SlackApp.route()', t => {
  let app = new SlackApp()
  let key = 'routeKey'
  let fn = () => {}

  app.route(key, fn)

  t.deepEqual(app._registry[key], fn)
})

test('SlackApp.getRoute()', t => {
  let app = new SlackApp()
  let key = 'routeKey'
  let fn = () => {}

  app.route(key, fn)

  t.deepEqual(app.getRoute(key), fn)
})

test('SlackApp.match()', t => {
  let app = new SlackApp()
  let fn = () => {}

  t.is(app._matchers.length, 0)

  app.match(fn)

  t.is(app._matchers.length, 1)
  t.deepEqual(app._matchers, [fn])
})

test.cb('SlackApp._handle() 1 mw, no override, no matchers', t => {
  t.plan(4)

  let app = new SlackApp()
  let message = {
    override: false,
    attachSlackApp: () => {}
  }
  let attachSlackAppStub = sinon.stub(message, 'attachSlackApp')

  app.use((msg, next) => {
    t.deepEqual(msg, message)

    next()
  })

  app._handle(message, (err, handled) => {
    t.true(attachSlackAppStub.calledOnce)
    t.is(err, null)
    t.false(handled)
    t.end()
  })
})

test('SlackApp._handle() no callback provided', t => {
  let app = new SlackApp()
  let message = {
    override: false,
    attachSlackApp: () => {}
  }
  let attachSlackAppStub = sinon.stub(message, 'attachSlackApp')

  app._handle(message)

  t.true(attachSlackAppStub.calledOnce)
})

test.cb('SlackApp._handle() 1 mw, no override, 1 matchers', t => {
  t.plan(4)

  let app = new SlackApp()
  let message = {
    override: false,
    attachSlackApp: () => {}
  }
  let attachSlackAppStub = sinon.stub(message, 'attachSlackApp')

  app
    .use((msg, next) => {
      t.deepEqual(msg, message)

      next()
    })
    .match((msg) => {
      return true
    })

  app._handle(message, (err, handled) => {
    t.true(attachSlackAppStub.calledOnce)
    t.is(err, null)
    t.true(handled)
    t.end()
  })
})

test.cb('SlackApp._handle() no mw, with override, no matchers', t => {
  t.plan(5)

  let app = new SlackApp()
  let message = {
    override: (msg) => {
      t.deepEqual(msg, message)
    },
    conversation_id: 'asdf',
    attachSlackApp: () => {}
  }
  let attachSlackAppStub = sinon.stub(message, 'attachSlackApp')
  let delSpy = sinon.spy(app.convoStore, 'del')

  app._handle(message, (err, handled) => {
    t.true(attachSlackAppStub.calledOnce)
    t.is(err, null)
    t.true(handled)
    t.true(delSpy.calledWith(message.conversation_id))

    t.end()
  })
})

test.cb('SlackApp._handle() with override and del error', t => {
  t.plan(6)

  let app = new SlackApp()
  let message = {
    onError: () => {},
    override: (msg) => {
      t.deepEqual(msg, message)
    },
    conversation_id: 'asdf',
    attachSlackApp: () => {}
  }
  let attachSlackAppStub = sinon.stub(message, 'attachSlackApp')
  let onErrorSpy = sinon.stub(app, 'onError')
  let delStub = sinon.stub(app.convoStore, 'del', (id, cb) => {
    cb(new Error('kaboom'))
  })

  app._handle(message, (err, handled) => {
    t.true(attachSlackAppStub.calledOnce)
    t.is(err.message, 'kaboom')
    t.true(handled)
    t.true(delStub.calledWith(message.conversation_id))
    t.true(onErrorSpy.calledOnce)

    t.end()
  })
})
