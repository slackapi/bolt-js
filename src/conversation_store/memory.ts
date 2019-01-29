'use strict'

/**
 * In memory implementation of a ConversationStore, primarily for testing
 * @private
 */

module.exports = class MemoryStore {
  constructor (opts) {
    this.store = {}
  }

  /**
   * Set the next function route handler for conversation id
   *
   * Parameters:
   * - `id` string - the conversation ID
   * - `params` object
   *     - `fnKey` sting - next route function key
   *     - `state` object - arbitrary object of data to be routed with the next function call
   *     - `expiration` - expiration time in time since unix epoch (milliseconds since 00:00:00 UTC on 1 January 1970)
   * - `callback` function  - (error) => {}
   */

  set (id, params, callback) {
    callback = callback || (() => {})
    params.id = id
    this.store[id] = params
    callback()
  }

  /**
   * Get the conversation state for a conversation ID
   *
   * Parameters:
   * - `id` string - the conversation ID
   * - `callback` function  - (error, value) => {}
   */

  get (id, callback) {
    let val = this.store[id]
    if (!val) {
      return callback(null, null)
    }
    if (val.expiration > 0 && val.expiration < Date.now()) {
      delete this.store[id]
      return callback(null, null)
    }
    callback(null, val)
  }

  /**
   * Delete a conversation state by ID
   *
   * Parameters:
   * - `id` string - the conversation ID
   * - `callback` function  - (error) => {}
   */

  del (id, callback) {
    callback = callback || (() => {})
    delete this.store[id]
    callback()
  }

}
