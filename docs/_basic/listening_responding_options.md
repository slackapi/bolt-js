---
title: Listening and responding to options
lang: en
slug: options
order: 14
---

<div class="section-content">
The `options()` method listens for incoming option request payloads from Slack. [Similar to `action()`](#action-listening),
an `action_id` or constraints object is required.

While it's recommended to use `action_id` for `external_select` menus, dialogs do not yet support Block Kit so you'll have to 
use the constraints object to filter on a `callback_id`.

To respond to options requests, you'll need to `ack()` with valid options. Both [external select response examples](https://api.slack.com/reference/messaging/block-elements#external-select) and [dialog response examples](https://api.slack.com/dialogs#dynamic_select_elements_external) can be found on our API site.
</div>

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
        "text": {
          "type": "plain_text",
          "text": result.label
        },
        "value": result.value
      });
    }

    await ack({
      "options": options
    });
  } else {
    await ack();
  }
});
```
