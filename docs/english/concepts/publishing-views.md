---
title: Publishing views to App Home
lang: en
slug: /concepts/publishing-views
---

[Home tabs](https://docs.slack.dev/surfaces/app-home) are customizable surfaces accessible via the sidebar and search that allow apps to display views on a per-user basis. After enabling App Home within your app configuration, home tabs can be published and updated by passing a `user_id` and [view payload](https://docs.slack.dev/reference/views/home-tab-views) to the [`views.publish`](https://docs.slack.dev/reference/methods/views.publish/) method.

You can subscribe to the [`app_home_opened`](https://docs.slack.dev/reference/events/app_home_opened) event to listen for when users open your App Home.

```javascript
// Listen for users opening your App Home
app.event('app_home_opened', async ({ event, client, logger }) => {
  try {
    // Call views.publish with the built-in client
    const result = await client.views.publish({
      // Use the user ID associated with the event
      user_id: event.user,
      view: {
        // Home tabs must be enabled in your app configuration page under "App Home"
        type: "home",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Welcome home, <@" + event.user + "> :house:*"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Learn how home tabs can be more useful and interactive <https://docs.slack.dev/surfaces/app-home|*in the documentation*>."
            }
          }
        ]
      }
    });

    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});
```