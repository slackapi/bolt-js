---
title: Listening and responding to global shortcuts
lang: en
slug: shortcuts
order: 8
---

<div class="section-content">
[Global shortcuts](https://api.slack.com/interactivity/shortcuts/using#global_shortcuts) are invokable UI elements within Slack clients, available in the composer and search menus. Your app can use the `shortcut()` method to listen to incoming global shortcut events. The method requires a `callbackId` parameter of type `string` or `RegExp`.

Global shortcuts must be acknowledged with `ack()` to inform Slack that your app has received the event.

Global shortcut payloads include a `trigger_id` which an app can use to [open a modal](#creating-modals) which confirms the action the user is taking. Note that global shortcut payloads do **not** include a channel ID. If your app needs access to a channel ID, you may use a [`conversations_select`](https://api.slack.com/reference/block-kit/block-elements#conversation_select) element within a modal.

⚠️ Note that [message shortcuts](https://api.slack.com/interactivity/shortcuts/using#message_shortcuts) still require apps to use the [`action()` method](#action-listening). **In the next major version of Bolt, both global and message shortcuts will use the `shortcut()` method.**
</div>

```javascript
// The open_modal shortcut opens a plain old modal
app.shortcut('open_modal', async ({ payload, ack, context }) => {
  // Acknowledge global shortcut request
  ack();

  try {
    // Call the views.open method using the built-in WebClient
    const result = await app.client.views.open({
      // The token you used to initialize your app is stored in the `context` object
      token: context.botToken,
      trigger_id: payload.trigger_id,
      view: {
        "type": "modal",
        "title": {
          "type": "plain_text",
          "text": "My App"
        },
        "close": {
          "type": "plain_text",
          "text": "Close"
        },
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "About the simplest modal you could conceive of :smile:\n\nMaybe <https://api.slack.com/reference/block-kit/interactive-components|*make the modal interactive*> or <https://api.slack.com/surfaces/modals/using#modifying|*learn more advanced modal use cases*>."
            }
          },
          {
            "type": "context",
            "elements": [
              {
                "type": "mrkdwn",
                "text": "Psssst this modal was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
              }
            ]
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
