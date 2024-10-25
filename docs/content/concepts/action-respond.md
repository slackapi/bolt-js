---
title: Responding to actions
lang: en
slug: /concepts/action-respond
---

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

<details>
<summary>
Using `respond()`
</summary>

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
</details>
