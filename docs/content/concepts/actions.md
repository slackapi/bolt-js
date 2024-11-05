---
title: Listening & responding to actions
lang: en
slug: /concepts/actions
---

Your app can listen and respond to user actions like button clicks, and menu selects, using the `action` method.

## Listening to actions

Actions can be filtered on an `action_id` of type string or RegExp object. `action_id`s act as unique identifiers for interactive components on the Slack platform. 

You’ll notice in all `action()` examples, `ack()` is used. It is required to call the `ack()` function within an action listener to acknowledge that the request was received from Slack. This is discussed in the [acknowledging requests section](/concepts/acknowledge).

View more information about the `block_actions` payload within the [relevant API documentation page](https://api.slack.com/reference/interaction-payloads). To access the full payload of a view from within a listener, reference the `body` argument within your callback function.

```javascript
// Your listener function will be called every time an interactive component with the action_id "approve_button" is triggered
app.action('approve_button', async ({ ack }) => {
  await ack();
  // Update the message to reflect the action
});
```

### Listening to actions using a constraint object

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

## Responding to actions

There are two main ways to respond to actions. The first (and most common) way is to use the `say` function. The `say` function sends a message back to the conversation where the incoming request took place.

The second way to respond to actions is using `respond()`, which is a simple utility to use the `response_url` associated with an action.

```javascript
// Your middleware will be called every time an interactive component with the action_id “approve_button” is triggered
app.action('approve_button', async ({ ack, say }) => {
  // Acknowledge action request
  await ack();
  await say('Request approved 👍');
});
```

### Using the `respond()` utility 

Since `respond()` is a utility for calling the `response_url`, it behaves in the same way. You can pass a JSON object with a new message payload that will be published back to the source of the original interaction with optional properties like `response_type` (which has a value of `in_channel` or `ephemeral`), `replace_original`, and `delete_original`.

```javascript
// Listens to actions triggered with action_id of “user_select”
app.action('user_select', async ({ action, ack, respond }) => {
  await ack();
  if (action.type === 'users_select') {
    await respond(`You selected <@${action.selected_user}>`);
  }
});
```