---
title: Publishing views to App Home
lang: en
slug: publishing-views
order: 13
---

<div class="section-content">
<a href="https://api.slack.com/surfaces/tabs/using">Home tabs</a> are customizable surfaces accessible via the sidebar and search that allow apps to display views on a per-user basis. After enabling App Home within your app configuration, home tabs can be published and updated by passing a `user_id` and <a href="https://api.slack.com/reference/block-kit/views">view payload</a> to the <a href="https://api.slack.com/methods/views.publish">`views.publish`</a> method.

You can subscribe to the <a href="https://api.slack.com/events/app_home_opened">`app_home_opened`</a> event to listen for when users open your App Home.
</div>

```javascript
// Listen for users opening your App Home
app.event('app_home_opened', async ({ event, client }) => {
  try {
    // Call views.publish with the built-in client
    const result = await client.views.publish({
      // Use the user ID associated with the event
      user_id: event.user,
      view: {
        // Home tabs must be enabled in your app configuration page under "App Home"
        "type": "home",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Welcome home, <@" + event.user + "> :house:*"
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Learn how home tabs can be more useful and interactive <https://api.slack.com/surfaces/tabs/using|*in the documentation*>."
            }
          }
        ]
      }
    });

    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});
```
