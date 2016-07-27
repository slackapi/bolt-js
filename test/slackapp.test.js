'use strict'

const test = require('ava').test
const sinon = require('sinon')
const SlackApp = require('../src/slackapp')
const Message = require('../src/message')

test('SlackApp()', t => {
  let options = {
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

test('SlackApp() convo_store string', t => {
  let app = new SlackApp({
    convo_store: 'memory'
  })

  t.is(typeof app.convoStore, 'object')
})

test('SlackApp.init()', t => {
  let app = new SlackApp()

  app.init()

  t.is(app._middleware.length, 2)
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

test.cb('SlackApp.command() w/o criteria', t => {
  t.plan(3)

  let app = new SlackApp()
  let message = {
    attachSlackApp () {},
    type: 'command',
    body: {
      command: 'test'
    }
  }

  app
    .command(message.body.command, (msg) => {
      t.deepEqual(msg, message)
    })
    ._handle(message, (err, handled) => {
      t.is(err, null)
      t.true(handled)
      t.end()
    })
})

test.cb('SlackApp.command() w/ criteria string', t => {
  t.plan(3)

  let app = new SlackApp()
  let message = {
    attachSlackApp () {},
    type: 'command',
    body: {
      command: 'test',
      text: 'hello'
    }
  }

  app
    .command(message.body.command, 'hel', (msg) => {
      t.deepEqual(msg, message)
    })
    ._handle(message, (err, handled) => {
      t.is(err, null)
      t.true(handled)
      t.end()
    })
})

test.cb('SlackApp.command() w/ criteria regex', t => {
  t.plan(3)

  let app = new SlackApp()
  let message = {
    attachSlackApp () {},
    type: 'command',
    body: {
      command: 'test',
      text: 'hello'
    }
  }

  app
    .command(message.body.command, /llo$/, (msg) => {
      t.deepEqual(msg, message)
    })
    ._handle(message, (err, handled) => {
      t.is(err, null)
      t.true(handled)
      t.end()
    })
})

test.cb('SlackApp.command() w/ non-matching string criteria', t => {
  t.plan(2)

  let app = new SlackApp()
  let message = {
    attachSlackApp () {},
    type: 'command',
    body: {
      command: 'test',
      text: 'hello'
    }
  }

  app
    .command(message.body.command, 'derp', () => {})
    ._handle(message, (err, handled) => {
      t.is(err, null)
      t.false(handled)
      t.end()
    })
})

test.cb('SlackApp.command() w/ non-matching regex criteria', t => {
  t.plan(2)

  let app = new SlackApp()
  let message = {
    attachSlackApp () {},
    type: 'command',
    body: {
      command: 'test',
      text: 'hello'
    }
  }

  app
    .command(message.body.command, /^derp$/, () => {})
    ._handle(message, (err, handled) => {
      t.is(err, null)
      t.false(handled)
      t.end()
    })
})

test.cb('SlackApp.action() w/o criteria', t => {
  t.plan(3)

  let app = new SlackApp()
  let message = {
    attachSlackApp () {},
    type: 'action',
    body: {
      actions: [
        { name: 'beep' }
      ],
      callback_id: 'my_callback',
      command: 'test'
    }
  }

  app
    .action(message.body.callback_id, (msg) => {
      t.deepEqual(msg, message)
    })
    ._handle(message, (err, handled) => {
      t.is(err, null)
      t.true(handled)
      t.end()
    })
})

test.cb('SlackApp.action() w/ criteria string', t => {
  t.plan(3)

  let app = new SlackApp()
  let message = {
    attachSlackApp () {},
    type: 'action',
    body: {
      actions: [
        { name: 'beep' }
      ],
      callback_id: 'my_callback',
      command: 'test'
    }
  }

  app
    .action(message.body.callback_id, 'beep', (msg) => {
      t.deepEqual(msg, message)
    })
    ._handle(message, (err, handled) => {
      t.is(err, null)
      t.true(handled)
      t.end()
    })
})

test.cb('SlackApp.action() w/ non-matching criteria', t => {
  t.plan(2)

  let app = new SlackApp()
  let message = {
    attachSlackApp () {},
    type: 'action',
    body: {
      actions: [
        { name: 'beep' }
      ],
      callback_id: 'my_callback',
      command: 'test'
    }
  }

  app
    .action(message.body.callback_id, 'boop', () => {})
    ._handle(message, (err, handled) => {
      t.is(err, null)
      t.false(handled)
      t.end()
    })
})

test.cb('SlackApp.message() w/o filter', t => {
  t.plan(3)

  let app = new SlackApp()
  let message = new Message('event', {
    event: {
      type: 'message',
      text: 'beep boop'
    }
  }, {})

  app
    .message('beep', (msg) => {
      t.deepEqual(msg, message)
    })
    ._handle(message, (err, handled) => {
      t.is(err, null)
      t.true(handled)
      t.end()
    })
})

test.cb('SlackApp.message() w/ filter', t => {
  t.plan(3)

  let app = new SlackApp()
  let message = new Message('event', {
    event: {
      type: 'message',
      text: 'beep boop'
    }
  }, {
    bot_user_id: 'asdf',
    channel_id: 'qwertyg'
  })

  app
    .message('beep', 'ambient', (msg) => {
      t.deepEqual(msg, message)
    })
    ._handle(message, (err, handled) => {
      t.is(err, null)
      t.true(handled)
      t.end()
    })
})

test.cb('SlackApp.event() w/ string criteria', t => {
  t.plan(3)

  let app = new SlackApp()
  let message = new Message('event', {
    event: {
      type: 'message',
      text: 'beep boop'
    }
  }, {})

  app
    .event('message', (msg) => {
      t.deepEqual(msg, message)
    })
    ._handle(message, (err, handled) => {
      t.is(err, null)
      t.true(handled)
      t.end()
    })
})

test.cb('SlackApp.event() w/ regex criteria', t => {
  t.plan(3)

  let app = new SlackApp()
  let message = new Message('event', {
    event: {
      type: 'message',
      text: 'beep boop'
    }
  }, {})

  app
    .event(/^mess/, (msg) => {
      t.deepEqual(msg, message)
    })
    ._handle(message, (err, handled) => {
      t.is(err, null)
      t.true(handled)
      t.end()
    })
})

test.cb('SlackApp._handle() w/ init()', t => {
  t.plan(3)

  let app = new SlackApp()
  let message = new Message('event', {
    event: {
      type: 'message',
      text: 'beep boop'
    }
  }, {})

  app
    .init()
    .event('message', (msg) => {
      t.deepEqual(msg, message)
    })
    ._handle(message, (err, handled) => {
      t.is(err, null)
      t.true(handled)
      t.end()
    })
})

test.cb('SlackApp.ignoreBotsMiddleware() with bot message', t => {
  let app = new SlackApp()
  let mw = app.ignoreBotsMiddleware()

  let message = new Message('event', {}, {
    bot_id: 'asdf'
  })

  // this callback is synchronous
  mw(message, () => {
    t.fail()
  })
  t.pass()
  t.end()
})

test.cb('SlackApp.ignoreBotsMiddleware() w/o bot message', t => {
  let app = new SlackApp()
  let mw = app.ignoreBotsMiddleware()

  let message = new Message('event', {}, {})

  // this callback is synchronous
  mw(message, () => {
    t.pass()
    t.end()
  })
})

test.cb('SlackApp.preprocessConversationMiddleware() w/ conversation', t => {
  t.plan(3)

  let app = new SlackApp()
  let mw = app.preprocessConversationMiddleware()
  let message = new Message('event', {}, {})
  message.conversation_id = 'convo_id'
  let convo = {
    fnKey: 'next-route',
    state: {
      beep: 'boop'
    }
  }

  let overrideStub = sinon.stub(message, 'attachOverrideRoute')
  let getStub = sinon.stub(app.convoStore, 'get', (id, cb) => {
    t.is(id, message.conversation_id)

    cb(null, convo)
  })

  mw(message, () => {
    t.true(overrideStub.calledWith(convo.fnKey, convo.state))
    t.true(getStub.calledOnce)
    t.end()
  })
})

test.cb('SlackApp.preprocessConversationMiddleware() w/o conversation', t => {
  t.plan(3)

  let app = new SlackApp()
  let mw = app.preprocessConversationMiddleware()
  let message = new Message('event', {}, {})
  message.conversation_id = 'convo_id'

  let overrideStub = sinon.stub(message, 'attachOverrideRoute')
  let getStub = sinon.stub(app.convoStore, 'get', (id, cb) => {
    t.is(id, message.conversation_id)

    cb(null, null)
  })

  mw(message, () => {
    t.false(overrideStub.called)
    t.true(getStub.calledOnce)
    t.end()
  })
})

test.cb('SlackApp.preprocessConversationMiddleware() w/ error', t => {
  t.plan(4)

  let app = new SlackApp()
  let mw = app.preprocessConversationMiddleware()
  let message = new Message('event', {}, {})
  message.conversation_id = 'convo_id'

  let onErrorStub = sinon.stub(app, 'onError')
  let overrideStub = sinon.stub(message, 'attachOverrideRoute')
  let getStub = sinon.stub(app.convoStore, 'get', (id, cb) => {
    t.is(id, message.conversation_id)

    cb(new Error('kaboom'))
  })

  mw(message, () => t.fail())

  t.false(overrideStub.called)
  t.true(getStub.calledOnce)
  t.true(onErrorStub.calledOnce)
  t.end()
})
