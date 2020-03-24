---
title: Conversation stores
lang: en
slug: conversation-store
order: 3
---

<div class="section-content">
Bolt for JavaScript includes support for a store, which sets and retrieves state related to a conversation. Conversation stores have two methods:
* `set()` modifies conversation state. `set()` requires a `conversationId` of type string, `value` of any type, and an optional `expiresAt` of type number. `set()` returns a `Promise`.
* `get()` fetches conversation state from the store. `get()` requires a `conversationId` of type string and returns a Promise with the conversation’s state.

`conversationContext()` is a built-in [global middleware](#global-middleware) that allows conversations to be updated by other middleware. When receiving an event, middleware functions can use `context.updateConversation()` to set state and `context.conversation` to retrieve it.

The built-in conversation store simply stores conversation state in memory. While this is sufficient for some situations, if there is more than one instance of your app running, the state will not be shared among the processes so you’ll want to implement a conversation store that fetches conversation state from a database.
</div>

```javascript
const app = new App({
  token,
  signingSecret,
  // It's more likely that you'd create a class for a convo store
  convoStore: new simpleConvoStore()
});

// A simple implementation of a conversation store with a Firebase-like database
class simpleConvoStore {
  set(conversationId, value, expiresAt) {
    // Returns a Promise
    return db().ref('conversations/' + conversationId).set({ value, expiresAt });
  }

  get(conversationId) {
    // Returns a Promise
    return new Promise((resolve, reject) => {
      db().ref('conversations/' + conversationId).once('value').then((result) => {
        if (result !== undefined) {
          if (result.expiresAt !== undefined && Date.now() > result.expiresAt) {
            db().ref('conversations/' + conversationId).delete();

            reject(new Error('Conversation expired'));
          }
          resolve(result.value)
        } else {
          // Conversation not found
          reject(new Error('Conversation not found'));
        }
      });
    });
  }
}
```