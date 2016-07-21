const MemoryStore = require('./memory')

module.exports = (opts) => {
  opts = opts || {}
  let storage

  if (!opts.type || opts.type === 'memory') {
    storage = new MemoryStore()
  }

  return storage
}
