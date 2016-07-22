'use strict'

const MemoryStore = require('./memory')

/**
 * Conversation store
 * @private
 */
module.exports = (opts) => {
  opts = opts || {}
  let storage

  if (!opts.type || opts.type === 'memory') {
    storage = new MemoryStore()
  }

  return storage
}
