'use strict'

// if it's an `ssl_check` request, just respond w/ a 200
module.exports = () => {
  return function sslCheck (req, res, next) {
    if (req.body && req.body.ssl_check) {
      return res.send()
    }

    next()
  }
}
