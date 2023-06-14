---
title: Customizing a receiver
lang: en
slug: receiver
order: 9
---

<div class="section-content">

#### Writing a custom receiver

A receiver is responsible for handling and parsing any incoming requests from Slack then sending it to the app, so that the app can add context and pass the request to your listeners. Receivers must conform to the [Receiver interface](https://github.com/slackapi/bolt-js/blob/%40slack/bolt%403.13.1/src/types/receiver.ts#L27-L31):

| Method       | Parameters                       | Return type |
|--------------|----------------------------------|-------------|
| `init()`     | `app: App`                       | `unknown`   |
| `start()`    | None                             | `Promise`   |
| `stop()`     | None                             | `Promise`   |

`init()` is called after Bolt for JavaScript app is created. This method gives the receiver a reference to an `App` to store so that it can call:
* `await app.processEvent(event)` whenever your app receives a request from Slack. It will throw if there is an unhandled error.

To use a custom receiver, you can pass it into the constructor when initializing your Bolt for JavaScript app. Here is what a basic custom receiver might look like.

For a more in-depth look at a receiver, [read the source code for the built-in `ExpressReceiver`](https://github.com/slackapi/bolt-js/blob/master/src/receivers/ExpressReceiver.ts)

---

#### Customizing built-in receivers

The built-in `HTTPReceiver`, `ExpressReceiver`, `AwsLambdaReceiver` and `SocketModeReceiver` accept several configuration options. For a full list of options, see the [Receiver options reference](/bolt-js/reference#receiver-options).

##### Extracting custom properties

Use the `customPropertiesExtractor` option to extract custom properties from incoming events. The event type depends on the type of receiver you are using, e.g. HTTP requests for `HTTPReceiver`s, websocket messages for `SocketModeReceiver`s.

This is particularly useful for extracting HTTP headers that you want to propagate to other services, for example, if you need to propagate a header for distributed tracing.

```javascript
const { App, HTTPReceiver } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: new HTTPReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    customPropertiesExtractor: (req) => {
      return {
        "headers": req.headers,
        "foo": "bar",
      };
    }
  }),
});

app.use(async ({ logger, context, next }) => {
  logger.info(context);
  await next();
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

You can find [more examples of extracting custom properties](https://github.com/slackapi/bolt-js/tree/%40slack/bolt%403.13.1/examples/custom-properties) from different types of receivers here.
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
