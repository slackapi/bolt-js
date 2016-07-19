module.exports = function (opts) {
  opts = opts || {}
  var storage

  if (!opts.type || opts.type === 'memory') {
    storage = new ConvoMemoryStorage()
  }

  return storage
}



class ConvoMemoryStorage {
  constructor(opts) {
    this.store = {}
  }

  set(key, nextFn, data, exp, cb) {
    cb = cb || (() => {})
    if (typeof data === 'function') {
      cb = data
      data = {}
      exp = 0
    }
    if (typeof exp === 'function') {
      cb = exp
      exp = 0
    }

    var envelope = {
      key: key,
      nextFn: nextFn,
      data: data,
      expire: Date.now() + exp * 1000
    }

    this.store[key] = envelope
    cb()
  }

  get(key, cb) {
    var val = this.store[key]
    if (!val) {
      return cb(null, null)
    }
    if (val.expire > 0 && val.expire < Date.now()) {
      delete this.store[key]
      return cb(null, null)
    }
    cb(null, val)
  }

  del(key, cb) {
    cb = cb || (() => {})
    process.nextTick(() => {
      delete this.store[key]
      cb()
    })
  }
}
