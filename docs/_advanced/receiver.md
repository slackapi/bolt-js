---
title: Customizing a receiver
slug: receiver
order: 8
---

<div class="section-content">
A receiver is responsible for handling and parsing any incoming requests from Slack, then emitting the request so the Bolt app can add context and pass the request to your app’s listeners. Receivers must conform to the Receiver interface:
* `Receiver.on('message',  listener)` should route all incoming requests that have been parsed to `onIncomingEvent()`. It’s called in the Bolt app as `this.receiver.on('message', message => this.onIncomingEvent(message))`.
* `Receiver.on('error',  listener)` should route errors to the global error handler. It’s called in the Bolt app as `this.receiver.on('error', error => this.onGlobalError(error))`.
* `start()` is intended to start a server and will be called by the end developer. It should return a `Promise`
* `stop()` is intended to stop the server and will be called by the end developer. It should return a `Promise`

To use a custom receiver, you’ll need to pass it into the constructor when initializing your Bolt app. Here is what a basic custom receiver might look like.
</div>

```javascript
TODO
```