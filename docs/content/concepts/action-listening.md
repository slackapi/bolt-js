---
title: Listening to actions
lang: en
slug: /concepts/action-listening
---

Your app can listen to user actions like button clicks, and menu selects, using the `action` method.

Actions can be filtered on an `action_id` of type string or RegExp object. `action_id`s act as unique identifiers for interactive components on the Slack platform. 

You’ll notice in all `action()` examples, `ack()` is used. It is required to call the `ack()` function within an action listener to acknowledge that the request was received from Slack. This is discussed in the [acknowledging requests section](/concepts/acknowledge).

:::info

Since v2, message shortcuts (previously message actions) now use the `shortcut()` method instead of the `action()` method. View the [migration guide for V2](/migration/migration-v2) to learn about the changes.

:::

View more information about the `block_actions` payload within the [relevant API documentation page](https://api.slack.com/reference/interaction-payloads). To access the full payload of a view from within a listener, reference the `body` argument within your callback function.

```javascript
// Your listener function will be called every time an interactive component with the action_id "approve_button" is triggered
app.action('approve_button', async ({ ack }) => {
  await ack();
  // Update the message to reflect the action
});
```

<details>
<summary>
Listening to actions using a constraint object
</summary>

You can use a constraints object to listen to `callback_id`s, `block_id`s, and `action_id`s (or any combination of them). Constraints in the object can be of type string or RegExp object.

```javascript
// Your listener function will only be called when the action_id matches 'select_user' AND the block_id matches 'assign_ticket'
app.action({ action_id: 'select_user', block_id: 'assign_ticket' },
  async ({ body, client, ack, logger }) => {
    await ack();
    try {
      // Make sure the action isn't from a view (modal or app home)
      if (body.message) {
        const result = await client.reactions.add({
          name: 'white_check_mark',
          timestamp: body.message.ts,
          channel: body.channel.id
        });

        logger.info(result);
      }
    }
    catch (error) {
      logger.error(error);
    }
  });
```

</details>