'use strict'

module.exports = (token) => {
  return function verifyTokenMiddleware (req, res, next) {
    // If token isn't set, we're not verifying
    if (!token) {
      return next()
    }

    let message = req.slapp
    let verifyToken = message && message.meta && message.meta.verify_token

    // test verify token
    if (token !== verifyToken) {
      res.status(403).send('Invalid token')
      return
    }

    next()
  }
}
