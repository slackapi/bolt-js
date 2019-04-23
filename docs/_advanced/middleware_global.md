---
title: Global middleware
slug: global-middleware
order: 4
---

<div class="section-content">
Global middleware is run for all incoming events before any listener middleware. You can add any number of global middleware to your app by utilizing `app.use(fn(payload,...,next))`. 

Both global and listener middleware must call `next()` to pass control of the execution chain to the next middleware, or call `next(error)` to pass an error back up the already-executed middleware chain.

As an example, let's say your app should only respond to users identified with a corresponding internal authentication service (an SSO provider or LDAP, for example). You may define a global middleware that looks up a user record in the authentication service and errors if the user is not found.
</div>

```javascript
// Authentication middleware that associates incoming event with user in Acme identity provider
function authWithAcme({ payload, context, say, next }) {
  const slackUserId = payload.user;
  const helpChannelId = 'C12345';

  // Assume we have a function that accepts a Slack user ID to find user details from Acme
  acme.lookupBySlackId(slackUserId)
    .then((user) => {
      // When the lookup is successful, populate context with Acme user details
      context.user = user;

      // Pass control to the next middleware and any listener functions
      next();
    })
    .catch((error) => {
      // This user wasn't found in Acme. Send them an error and don't continue processing event
      if (error.message === 'Not Found') {
        app.client.chat.postEphemeral({
          token: context.botToken,
          channel: payload.channel,
          user: slackUserId,
          text: `Sorry <@${slackUserId}, you aren't registered in Acme. Please post in <#${helpChannelId} for assistance.`
        });
        return;
      }

      // Pass control to previous middleware (if any) or the global error handler
      next(error);
    });
}
```