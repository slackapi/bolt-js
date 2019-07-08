---
title: Customizing a receiver
lang: en
slug: receiver
order: 8
---

<div class="section-content">
A receiver is responsible for handling and parsing any incoming events from Slack, then emitting the event so the Bolt app can add context and pass it to your app’s listeners. Receivers must conform to the Receiver interface:

| Method       | Parameters                       | Return type |
|--------------|----------------------------------|-------------|
| `on()`       | `type: string`, `listener: fn()` | `unknown`   |
| `start()`    | None                             | `Promise`   |
| `stop()`     | None                             | `Promise`   |

`on()` is called two times in the Bolt app:
* `Receiver.on('message',  listener)` should route all incoming requests that have been parsed to `onIncomingEvent()`. It’s called in the Bolt app as `this.receiver.on('message', message => this.onIncomingEvent(message))`.
* `Receiver.on('error',  listener)` should route errors to the global error handler. It’s called in the Bolt app as `this.receiver.on('error', error => this.onGlobalError(error))`.

To use a custom receiver, you can pass it into the constructor when initializing your Bolt app. Here is what a basic custom receiver might look like.

For a more in-depth look at a receiver, [read the source code for the built-in Express receiver](https://github.com/slackapi/bolt/blob/master/src/ExpressReceiver.ts)
</div>

```javascript
import { EventEmitter } from 'events';
import { createServer } from 'http';
import express from 'express';

// EventEmitter handles the on() function for us
// https://nodejs.org/api/events.html#events_emitter_on_eventname_listener
class simpleReceiver extends EventEmitter {
  constructor(signingSecret, endpoints) {
    super();
    this.app = express();
    this.server = createServer(this.app);

    for (const endpoint of endpoints) {
      this.app.post(endpoint, this.requestHandler.bind(this));
    }
  }

  start(port) {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(port, () => {
          resolve(this.server);
        });
      } catch(error) {
        reject(error);
      }
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      this.server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      })
    })
  }

  // This is a very simple implementation. Look at the ExpressReceiver source for more detail
  requestHandler(req, res) {
    // Assume parseBody function exists to parse incoming requests
    const parsedReq = parseBody(req);
    const event = {
      body: parsedReq.body,
      // Receivers are responsible for handling acknowledgements
      ack: (response) => {
        if (!response) {
          res.send('')
        } else {
          res.send(response);
        }
      }
    };
    this.emit('message', event);
  }
}
```