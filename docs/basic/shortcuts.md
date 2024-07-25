---
title: Listening and responding to shortcuts
lang: en
slug: /concepts/shortcuts
---



The `shortcut()` method supports both [global shortcuts](https://api.slack.com/interactivity/shortcuts/using#global_shortcuts) and [message shortcuts](https://api.slack.com/interactivity/shortcuts/using#message_shortcuts).

Shortcuts are invocable entry points to apps. Global shortcuts are available from within search in Slack. Message shortcuts are available in the context menus of messages. Your app can use the `shortcut()` method to listen to incoming shortcut requests. The method requires a `callback_id` parameter of type `string` or `RegExp`.

:::warning 

If you use `shortcut()` multiple times with overlapping RegExp matches, _all_ matching listeners will run. Design your regular expressions to avoid this possibility.

:::

Shortcuts must be acknowledged with `ack()` to inform Slack that your app has received the request.

Shortcuts include a `trigger_id` which an app can use to [open a modal](/concepts/creating-modals) that confirms the action the user is taking. 

When configuring shortcuts within your app configuration, you'll continue to append `/slack/events` to your request URL.

:::warning

Global shortcuts do **not** include a channel ID. If your app needs access to a channel ID, you may use a [`conversations_select`](https://api.slack.com/reference/block-kit/block-elements#conversation_select) element within a modal. Message shortcuts do include channel ID.

:::



```javascript
// The open_modal shortcut opens a plain old modal
app.shortcut('open_modal', async ({ shortcut, ack, client, logger }) => {

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

    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});
```

<details>
  <summary>
  Listening to shortcuts using a constraint object
  </summary>

  
  You can use a constraints object to listen to `callback_id` and `type` values. Constraints in the object can be of type string or RegExp object.
  

  ```javascript
  // Your middleware will only be called when the callback_id matches 'open_modal' AND the type matches 'message_action'
  app.shortcut({ callback_id: 'open_modal', type: 'message_action' }, async ({ shortcut, ack, client, logger }) => {
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

      logger.info(result);
    }
    catch (error) {
      logger.error(error);
    }
  });
  ```

</details>
