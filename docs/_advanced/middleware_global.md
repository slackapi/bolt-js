---
title: Global middleware
lang: en
slug: global-middleware
order: 4
---

<div class="section-content">
Global middleware is run for all incoming events before any listener middleware. You can add any number of global middleware to your app by utilizing `app.use(fn)`. The middleware function `fn` is called with the same arguments as listeners and an additional `next` function.

Both global and listener middleware must call `await next()` to pass control of the execution chain to the next middleware, or call `throw` to pass an error back up the previously-executed middleware chain.

As an example, let's say your app should only respond to users identified with a corresponding internal authentication service (an SSO provider or LDAP, for example). You may define a global middleware that looks up a user record in the authentication service and errors if the user is not found.

*Note: Since v2, global middleware was updated to support `async` functions! View the [migration guide for V2](https://slack.dev/bolt/tutorial/migration-v2) to learn about the changes.*
</div>

```javascript
// Authentication middleware that associates incoming event with user in Acme identity provider
async function authWithAcme({ payload, context, next }) {
  const slackUserId = payload.user;
  const helpChannelId = 'C12345';

  // Assume we have a function that accepts a Slack user ID to find user details from Acme
  try {
    // Assume we have a function that can take a Slack user ID as input to find user details from the provider
    const user = await acme.lookupBySlackId(slackUserId);
      
    // When the user lookup is successful, add the user details to the context
    context.user = user;
  } catch (error) {
    // This user wasn't found in Acme. Send them an error and don't continue processing event
    if (error.message === 'Not Found') {
        await app.client.chat.postEphemeral({
          token: context.botToken,
          channel: payload.channel,
          user: slackUserId,
          text: `Sorry <@${slackUserId}>, you aren't registered in Acme. Please post in <#${helpChannelId}> for assistance.`
        });
        return;
    }
    
    // Pass control to previous middleware (if any) or the global error handler
    throw error;
  }
  
  // Pass control to the next middleware (if there are any) and the listener functions
  // Note: You probably don't want to call this inside a `try` block, or any middleware
  //       after this one that throws will be caught by it. 
  await next();
}
```
