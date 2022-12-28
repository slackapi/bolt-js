---
title: Listening to actions
lang: en
slug: action-listening
order: 5
---

<div class="section-content">
Your app can listen to user actions like button clicks, and menu selects, using the `action` method.

Actions can be filtered on an `action_id` of type string or RegExp object. `action_id`s act as unique identifiers for interactive components on the Slack platform. 

You’ll notice in all `action()` examples, `ack()` is used. It is required to call the `ack()` function within an action listener to acknowledge that the request was received from Slack. This is discussed in the [acknowledging requests section](#acknowledge).

*Note: Since v2, message shortcuts (previously message actions) now use the `shortcut()` method instead of the `action()` method. View the [migration guide for V2](https://slack.dev/bolt/tutorial/migration-v2) to learn about the changes.*

Learn more about the `block_actions` payload, [here](https://api.slack.com/reference/interaction-). To access the full payload of a view from within a listener, reference the `body` argument within your callback function.

</div>

```javascript
// Your listener function will be called every time an interactive component with the action_id "approve_button" is triggered
app.action('approve_button', async ({ ack }) => {
  await ack();
  // Update the message to reflect the action
});
```

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">Listening to actions using a constraint object</h4>
</summary>

<div class="secondary-content" markdown="0">
You can use a constraints object to listen to `callback_id`s, `block_id`s, and `action_id`s (or any combination of them). Constraints in the object can be of type string or RegExp object.
</div>

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
