'use strict'

const test = require('ava').test
const sinon = require('sinon')
const fixtures = require('./fixtures/')
const CheckSignature = require('../src/receiver/middleware/check-signature')
const SECRET = 'shhhhsecret'
const VERSION = 'v0'

test.cb('CheckSignature() no signing_secret option', t => {
  let mw = CheckSignature()

  mw(getSignedRequest(mw), fixtures.getMockRes(), () => {
    t.pass()
    t.end()
  })
})

test('CheckSignature() signing_secret option no signature or timestamp header', t => {
  let mw = CheckSignature(SECRET)
  let res = fixtures.getMockRes()

  let statusStub = sinon.stub(res, 'status', () => { return res })
  let sendStub = sinon.stub(res, 'send')

  mw(getSignedRequest(mw, { signature: false, timestamp: false }), res, () => {})
  t.true(statusStub.calledWith(403))
  t.true(sendStub.calledWith('Invalid signature'))
})

test.cb('CheckSignature() signing_secret option no signature or timestamp header w/ error callback', t => {
  let mw = CheckSignature(SECRET, VERSION, (err) => {
    t.is(err, 'Invalid signature')
    t.pass()
    t.end()
  })
  let res = fixtures.getMockRes()

  let statusStub = sinon.stub(res, 'status', () => { return res })
  let sendStub = sinon.stub(res, 'send')

  mw(getSignedRequest(mw, { signature: false, timestamp: false }), res, () => { })
  t.true(statusStub.calledWith(403))
  t.true(sendStub.calledWith('Invalid signature'))
})

test('CheckSignature() signing_secret option w/ signature no timestamp header', t => {
  let mw = CheckSignature(SECRET)
  let res = fixtures.getMockRes()

  let statusStub = sinon.stub(res, 'status', () => { return res })
  let sendStub = sinon.stub(res, 'send')

  mw(getSignedRequest(mw, { timestamp: false }), res, () => { })
  t.true(statusStub.calledWith(403))
  t.true(sendStub.calledWith('Invalid signature'))
})

test('CheckSignature() signing_secret option no signature w/ timestamp header', t => {
  let mw = CheckSignature(SECRET)
  let res = fixtures.getMockRes()

  let statusStub = sinon.stub(res, 'status', () => { return res })
  let sendStub = sinon.stub(res, 'send')

  mw(getSignedRequest(mw, { signature: false }), res, () => { })
  t.true(statusStub.calledWith(403))
  t.true(sendStub.calledWith('Invalid signature'))
})

test.cb('CheckSignature() signing_secret option w/ valid signature', t => {
  let mw = CheckSignature(SECRET, VERSION, (err) => {
    t.fail(err)
    t.end()
  })
  let res = fixtures.getMockRes()

  mw(getSignedRequest(mw, {}), res, () => {
    t.pass()
    t.end()
  })
})

test('CheckSignature() signing_secret option w/ invalid signature', t => {
  let mw = CheckSignature(SECRET)
  let res = fixtures.getMockRes()

  let statusStub = sinon.stub(res, 'status', () => { return res })
  let sendStub = sinon.stub(res, 'send')

  mw(getSignedRequest(mw, {}, false), res, () => { })
  t.true(statusStub.calledWith(403))
  t.true(sendStub.calledWith('Invalid signature'))
})

function getSignedRequest (mw, { signature = true, timestamp = true } = {}, validSignature = true) {
  let rawBody = 'thisisjustatestbody'
  let currentTimestamp = Date.now()
  let computedSignature = validSignature
    ? mw.compute(currentTimestamp, rawBody)
    : 'thisisaninvalidsignature'

  return fixtures.getMockReq({
    rawBody,
    slapp: {
      meta: {
        signature: signature ? computedSignature : undefined,
        timestamp: timestamp ? currentTimestamp : undefined
      }
    }
  })
}
