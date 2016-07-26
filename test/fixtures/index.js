'use strict'

exports.getMockReq = function (req) {
  return Object.assign({
    slackapp: {
      meta: {}
    }
  }, req || {})
}

exports.getMockRes = function (res) {
  let mockRes = Object.assign({
    send: () => {},
    status: () => { return mockRes }
  }, res || {})

  return mockRes
}

exports.getMockHeaders = function (headers) {
  return Object.assign({
    'bb-slackaccesstoken': 'slackaccesstoken',
    'bb-slackuserid': 'slackuserid',
    'bb-slackbotaccesstoken': 'slackbotaccesstoken',
    'bb-slackbotuserid': 'slackbotuserid'
  }, headers || {})
}
