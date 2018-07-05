'use strict'
const crypto = require('crypto')

module.exports = (secret, version = 'v0', onError) => {
  function invalidSignature (res) {
    if (onError) {
      onError('Invalid signature')
    }
    res.status(403).send('Invalid signature')
  }

  function checkSignatureMiddleware (req, res, next) {
    // If secret isn't set, we're not checking signature
    if (!secret) {
      return next()
    }

    let rawBody = req.rawBody
    let message = req.slapp
    let signature = message && message.meta && message.meta.signature
    let timestamp = message && message.meta && message.meta.timestamp

    if (!signature || !timestamp || !rawBody) {
      return invalidSignature(res)
    }

    // Verify request signature matches
    let computedSignature = checkSignatureMiddleware.compute(timestamp, rawBody)

    if (computedSignature !== signature) {
      return invalidSignature(res)
    }

    next()
  }

  // Expose this on mw instance for tests or manual computation if needed externally
  checkSignatureMiddleware.compute = function (timestamp, rawBody) {
    if (!secret) {
      return null
    }

    let basestring = `${version}:${timestamp}:${rawBody}`
    let digest = crypto.createHmac('sha256', secret)
      .update(basestring)
      .digest('hex')
    return `${version}=${digest}`
  }

  return checkSignatureMiddleware
}
