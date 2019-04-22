---
title: Responding to actions
slug: action-respond
order: 8
---

<div class="section-content">
There are two main ways to respond to actions. The first way (and the most common way) is using the `say` function. The `say` function sends a message back to the conversation where the incoming event took place.

The second way to respond to actions is using `respond()`. This is a simple utility to use the `response_url` associated with an action.
</div>

```javascript
// Your middleware will be called every time an interactive component with the action_id “approve_button” is triggered
app.action('approve_button', async ({ ack, say }) => {
  ack();
  say('Request approved 👍');
});
```

<details markdown="0">
<summary class="section-head">
<h4 class="section-head">Using respond</h4>
</summary>

<div class="secondary-wrapper">

<div class="secondary-content">
In addition to using `say()`, you can respond to them using `respond()`. `respond()` is a utility for calling the `response_url`, so it behaves in the same way. You can pass a JSON object with a new message payload that will be published back to the source of the original interaction. Response URLs are covered in more depth [on our API site](https://api.slack.com/messaging/interactivity).
</div>

```javascript
// Listens to actions triggered with action_id of “user_select”
app.action('user_select', async ({ action, ack, respond }) => {
	ack();
	respond(`You selected <@${action.selected_user}>`);
});
```

</div>
</details>