/**
 * In memory implementation of a ConversationStore, primarily for testing
 */

module.exports = class MemoryStore {
  constructor(opts) {
    this.store = {}
  }

  set(key, nextFn, data, exp, callback) {
    callback = callback || (() => {})
    if (typeof data === 'function') {
      callback = data
      data = {}
      exp = 0
    }
    if (typeof exp === 'function') {
      callback = exp
      exp = 0
    }

    let envelope = {
      key: key,
      nextFn: nextFn,
      data: data,
      expire: Date.now() + exp * 1000
    }

    this.store[key] = envelope
    callback()
  }

  get(key, callback) {
    let val = this.store[key]
    if (!val) {
      return callback(null, null)
    }
    if (val.expire > 0 && val.expire < Date.now()) {
      delete this.store[key]
      return callback(null, null)
    }
    callback(null, val)
  }

  del(key, callback) {
    callback = callback || (() => {})
    delete this.store[key]
    callback()
  }

}
