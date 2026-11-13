---
"@slack/bolt": minor
---

feat(HTTPReceiver): add invalidRequestSignatureHandler callback

Details of a failed request can be parsed and logged with the customized `invalidRequestSignatureHandler` callback for the `HTTPReceiver` receiver:

```javascript
import { App, HTTPReceiver } from "@slack/bolt";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: new HTTPReceiver({
    signingSecret: "unexpectedvalue",
    invalidRequestSignatureHandler: (args) => {
      app.logger.warn(args);
    },
  }),
});
```
