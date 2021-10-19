---
title: Listening to actions
lang: en
slug: action-listening
order: 5
---

## Listening to actions

Your app can listen to user actions like button clicks, and menu selects, using the `action` method.

Actions can be filtered on an `action_id` of type string or RegExp object. `action_id`s act as unique identifiers for interactive components on the Slack platform. 

You’ll notice in all `action()` examples, `ack()` is used. It is required to call the `ack()` function within an action listener to acknowledge that the request was received from Slack. This is discussed in the [acknowledging requests section](#acknowledge).

*Note: Since v2, message shortcuts (previously message actions) now use the `shortcut()` method instead of the `action()` method. View the [migration guide for V2](https://slack.dev/bolt/tutorial/migration-v2) to learn about the changes.*

```javascript
// Your listener function will be called every time an interactive component with the action_id "approve_button" is triggered
app.action('approve_button', async ({ ack }) => {
  await ack();
  // Update the message to reflect the action
});
```

#### Listening to actions using a constraint object

You can use a constraints object to listen to `callback_id`s, `block_id`s, and `action_id`s (or any combination of them). Constraints in the object can be of type string or RegExp object.

```javascript
// Your listener function will only be called when the action_id matches 'select_user' AND the block_id matches 'assign_ticket'
app.action({ action_id: 'select_user', block_id: 'assign_ticket' },
  async ({ body, client, ack }) => {
    await ack();
    try {
      // Make sure the action isn't from a view (modal or app home)
      if (body.message) {
        const result = await client.reactions.add({
          name: 'white_check_mark',
          timestamp: body.message.ts,
          channel: body.channel.id
        });

        console.log(result);
      }
    }
    catch (error) {
      console.error(error);
    }
  });
```