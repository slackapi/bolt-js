
// The purpose of this middleware is to hook into the body-parser verify step
// to capture the raw request body so it can be used later to check the signature
module.exports = function verify (req, res, buffer, encoding) {
  req.rawBody = buffer.toString()
}
