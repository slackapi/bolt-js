---
title: Customizing a receiver
lang: en
slug: receiver
order: 8
---

<div class="section-content">
A receiver is responsible for handling and parsing any incoming events from Slack, then emitting the event so the Bolt for JavaScript app can add context and pass it to your app’s listeners. Receivers must conform to the Receiver interface:

| Method       | Parameters                       | Return type |
|--------------|----------------------------------|-------------|
| `init()`     | `app: App`                       | `unknown`   |
| `start()`    | None                             | `Promise`   |
| `stop()`     | None                             | `Promise`   |

`init()` is called after it's been passed to a created Bolt for JavaScript app, it's purpose is to give you an instance of bolt so that you can call:
* `await app.processEvent(event)` whenever your app receives an event from Slack. It will reject if there is an unhandled error.
* `await app.handleError` whenever you need to route errors to the global error handler. This gives the developer a chance to handle it.

To use a custom receiver, you can pass it into the constructor when initializing your Bolt for JavaScript app. Here is what a basic custom receiver might look like.

For a more in-depth look at a receiver, [read the source code for the built-in Express receiver](https://github.com/slackapi/bolt/blob/master/src/ExpressReceiver.ts)
</div>

```javascript
import { createServer } from 'http';
import express from 'express';

class SimpleReceiver  {
  constructor(signingSecret, endpoints) {
    this.app = express();
    this.server = createServer(this.app);

    for (const endpoint of endpoints) {
      this.app.post(endpoint, this.requestHandler.bind(this));
    }
  }
  
  init(app) {
    this.bolt = app;
  }

  start(port) {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(port, () => {
          resolve(this.server);
        });
      } catch (error) {
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
  async requestHandler(req, res) {
    let ackCalled = false;
    // Assume parseBody function exists to parse incoming requests
    const parsedReq = parseBody(req);
    const event = {
      body: parsedReq.body,
      // Receivers are responsible for handling acknowledgements
      // `ack` should be prepared to be called multiple times and 
      // possibly with `response` as an error
      ack: (response) => {
        if (ackCalled) {
          return;
        }
        
        if (response instanceof Error) {
          res.status(500).send();
        } else if (!response) {
          res.send('')
        } else {
          res.send(response);
        }
        
        ackCalled = true;
      }
    };
    await this.bolt.processEvent(event);
  }
}
```
