'use strict'

const test = require('ava').test
const Verify = require('../build/receiver/middleware/body-parser-verify')

test('CheckSignature() signing_secret option no signature or timestamp header', t => {
  let rawBody = 'thisisjustarequestbody'
  let req = {}
  let buffer = new Buffer(rawBody)

  Verify(req, {}, buffer)
  t.is(req.rawBody, rawBody)
})
