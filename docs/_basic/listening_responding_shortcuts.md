---
title: Listening and responding to shortcuts
lang: en
slug: shortcuts
order: 8
---

<div class="section-content">

The `shortcut()` method supports both [global shortcuts](https://api.slack.com/interactivity/shortcuts/using#global_shortcuts) and [message shortcuts](https://api.slack.com/interactivity/shortcuts/using#message_shortcuts).

Shortcuts are invokable entry points to apps. Global shortcuts are available from within search in Slack. Message shortcuts are available in the context menus of messages. Your app can use the `shortcut()` method to listen to incoming shortcut events. The method requires a `callback_id` parameter of type `string` or `RegExp`.

Shortcuts must be acknowledged with `ack()` to inform Slack that your app has received the event.

Shortcuts include a `trigger_id` which an app can use to [open a modal](#creating-modals) that confirms the action the user is taking. 

When configuring shortcuts within your app configuration, you'll continue to append `/slack/events` to your request URL.

⚠️ Note that global shortcuts do **not** include a channel ID. If your app needs access to a channel ID, you may use a [`conversations_select`](https://api.slack.com/reference/block-kit/block-elements#conversation_select) element within a modal. Message shortcuts do include channel ID.

</div>

```javascript
// The open_modal shortcut opens a plain old modal
app.shortcut('open_modal', async ({ shortcut, ack, client }) => {

  try {
    // Acknowledge shortcut request
    await ack();

    // Call the views.open method using one of the built-in WebClients
    const result = await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: {
        type: "modal",
        title: {
          type: "plain_text",
          text: "My App"
        },
        close: {
          type: "plain_text",
          text: "Close"
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "About the simplest modal you could conceive of :smile:\n\nMaybe <https://api.slack.com/reference/block-kit/interactive-components|*make the modal interactive*> or <https://api.slack.com/surfaces/modals/using#modifying|*learn more advanced modal use cases*>."
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "Psssst this modal was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
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

<details class="secondary-wrapper">
  <summary class="section-head" markdown="0">
  <h4 class="section-head">Listening to shortcuts using a constraint object</h4>
  </summary>

  <div class="secondary-content" markdown="0">
  You can use a constraints object to listen to `callback_id`s, and `type`s. Constraints in the object can be of type string or RegExp object.
  </div>

  ```javascript
  // Your middleware will only be called when the callback_id matches 'open_modal' AND the type matches 'message_action'
  app.shortcut({ callback_id: 'open_modal', type: 'message_action' }, async ({ shortcut, ack, client }) => {
    try {
      // Acknowledge shortcut request
      await ack();

      // Call the views.open method using one of the built-in WebClients
      const result = await client.views.open({
        trigger_id: shortcut.trigger_id,
        view: {
          type: "modal",
          title: {
            type: "plain_text",
            text: "My App"
          },
          close: {
            type: "plain_text",
            text: "Close"
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "About the simplest modal you could conceive of :smile:\n\nMaybe <https://api.slack.com/reference/block-kit/interactive-components|*make the modal interactive*> or <https://api.slack.com/surfaces/modals/using#modifying|*learn more advanced modal use cases*>."
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: "Psssst this modal was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
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

</details>
