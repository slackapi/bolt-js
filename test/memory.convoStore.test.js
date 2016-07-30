'use strict'

const test = require('ava').test
const Store = require('../src/conversation_store/')
const Memory = require('../src/conversation_store/memory')

test('Store() w/ no type', t => {
  let store = Store()

  t.true(store instanceof Memory)
})

test('Store() w/ memory type', t => {
  let store = Store({
    type: 'memory'
  })

  t.true(store instanceof Memory)
})

test('Store() w/ invalid type', t => {
  t.throws(() => {
    Store({ type: 'invalid' })
  })
})

test.cb('Memory() crud', t => {
  t.plan(5)

  let store = new Memory()
  let id = 'convo_id'
  let state = {
    beep: 'boop'
  }

  store.set(id, state, () => {
    store.get(id, (err, v) => {
      t.is(err, null)
      t.is(v.id, id)
      t.is(v.beep, state.beep)

      // Now delete and make sure it's gone
      store.del(id, () => {
        store.get(id, (err, v) => {
          t.is(err, null)
          t.is(v, null)
          t.end()
        })
      })
    })
  })
})

test.cb('Memory() set w/o callback', t => {
  t.plan(3)

  let store = new Memory()
  let id = 'convo_id'
  let state = {
    beep: 'boop'
  }

  store.set(id, state)

  store.get(id, (err, v) => {
    t.is(err, null)
    t.is(v.id, id)
    t.is(v.beep, state.beep)
    t.end()
  })
})

test.cb('Memory() del w/o callback', t => {
  t.plan(2)

  let store = new Memory()
  let id = 'convo_id'
  let state = {
    beep: 'boop'
  }

  // abusing the synchronous nature of the memory store for simpler tests ¯\_(ツ)_/¯
  store.set(id, state)
  store.del(id)

  store.get(id, (err, v) => {
    t.is(err, null)
    t.is(v, null)
    t.end()
  })
})

test.cb('Memory() get expired', t => {
  t.plan(2)

  let store = new Memory()
  let id = 'convo_id'
  let state = {
    beep: 'boop',
    expiration: Date.now() - 1000
  }

  // set an expired value
  store.set(id, state, () => {
    store.get(id, (err, v) => {
      t.is(err, null)
      t.is(v, null)
      t.end()
    })
  })
})

test.cb('Memory() get non expired', t => {
  t.plan(3)

  let store = new Memory()
  let id = 'convo_id'
  let state = {
    beep: 'boop',
    expiration: Date.now() + 10000
  }

  // set an expired value
  store.set(id, state, () => {
    store.get(id, (err, v) => {
      t.is(err, null)
      t.is(v.id, id)
      t.is(v.beep, state.beep)
      t.end()
    })
  })
})
