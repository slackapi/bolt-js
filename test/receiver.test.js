'use strict'

const test = require('ava').test
const sinon = require('sinon')
const fs = require('fs')
const Receiver = require('../src/receiver')

test('Receiver() w/ record', t => {
  let writeStub = sinon.stub(fs, 'writeFileSync', () => {})
  let appendStub = sinon.stub(fs, 'appendFile', () => {})

  let rec = new Receiver({
    record: true
  })

  t.true(writeStub.calledOnce)

  rec.emit('message', {})

  t.true(appendStub.calledOnce)
})
