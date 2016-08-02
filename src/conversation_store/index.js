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

  if (!storage) {
    throw new Error('Could not define storage for type ' + opts.type)
  }

  return storage
}
