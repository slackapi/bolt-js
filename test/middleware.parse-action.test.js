'use strict'

const test = require('ava').test
const sinon = require('sinon')
const fixtures = require('./fixtures/')
const ParseAction = require('../src/receiver/middleware/parse-action')

test('ParseAction()', t => {
  let mw = ParseAction()
  t.is(mw.length, 3)
})
