---
title: Using the Web API
lang: en
slug: /concepts/web-api
---

You can call any [Web API method](https://docs.slack.dev/reference/methods) using the [`WebClient`](https://tools.slack.dev/node-slack-sdk/web-api) provided to your app's listeners as `client`. This uses either the token that initialized your app **or** the token that is returned from the [`authorize`](/concepts/authorization) function for the incoming event. The built-in [OAuth support](/concepts/authenticating-oauth) handles the second case by default.

Your Bolt app also has a top-level `app.client` which you can manually pass the `token` parameter. If the incoming request is not authorized or you're calling a method from outside of a listener, use the top-level `app.client`.

Calling one of the [`WebClient`](https://tools.slack.dev/node-slack-sdk/web-api) methods will return a Promise containing the response from Slack, regardless of whether you use the top-level or listener's client.

Since the introduction of [org wide app installations](https://docs.slack.dev/enterprise-grid/), [some web-api methods](https://docs.slack.dev/enterprise-grid/developing-for-enterprise-grid#using-apis) now require a `team_id` parameter to indicate which workspace to act on. Bolt for JavaScript will attempt to infer the `team_id` value based on incoming payloads and pass it along to `client`. This is handy for existing applications looking to add support for org wide installations and not spend time updating all of these web-api calls.

```javascript
// Unix Epoch time for September 30, 2019 11:59:59 PM
const whenSeptemberEnds = 1569887999;

app.message('wake me up', async ({ message, client, logger }) => {
  try {
    // Call chat.scheduleMessage with the built-in client
    const result = await client.chat.scheduleMessage({
      channel: message.channel,
      post_at: whenSeptemberEnds,
      text: 'Summer has come and passed'
    });
  }
  catch (error) {
    logger.error(error);
  }
});
```