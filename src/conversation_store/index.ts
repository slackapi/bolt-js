const MemoryStore = require('./memory')

/**
 * Conversation store
 * @private
 */
export default (opts: any) => {
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

  // /**
  //  * Middleware that gets an existing conversation from the conversation store
  //  * or initialize a new one.
  //  *
  //  * @api private
  //  */

  // preprocessConversationMiddleware () {
  //   return (msg, next) => {
  //     this.convoStore.get(msg.conversation_id, (err, val) => {
  //       if (err) {
  //         return this.emit('error', err)
  //       }

  //       if (val) {
  //         msg.attachOverrideRoute(val.fnKey, val.state)
  //       }

  //       next()
  //     })
  //   }
  // }
