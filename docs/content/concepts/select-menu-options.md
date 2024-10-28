---
title: Listening & responding to select menu options
lang: en
slug: /concepts/options
---

The `options()` method listens for incoming option request payloads from Slack. [Similar to `action()`](/concepts/actions),
an `action_id` or constraints object is required.

While it's recommended to use `action_id` for `external_select` menus, dialogs do not yet support Block Kit so you'll have to 
use the constraints object to filter on a `callback_id`.

To respond to options requests, you'll need to `ack()` with valid options. Both [external select response examples](https://api.slack.com/reference/messaging/block-elements#external_select) and [dialog response examples](https://api.slack.com/legacy/dialogs#dynamic_select_elements_external) can be found on our API site.

```javascript
// Example of responding to an external_select options request
app.options('external_action', async ({ options, ack }) => {
  // Get information specific to a team or channel
  const results = await db.get(options.team.id);

  if (results) {
    let options = [];
    // Collect information in options array to send in Slack ack response
    for (const result of results) {
      options.push({
        text: {
          type: "plain_text",
          text: result.label
        },
        value: result.value
      });
    }

    await ack({
      options: options
    });
  } else {
    await ack();
  }
});
```
