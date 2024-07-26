---
title: Responding to interactivity
lang: en
slug: /concepts/responding-to-interactivity
---

Interactive elements provided to the user from within the `function()` method’s callback are associated with that unique `function_executed` event. This association allows for the completion of functions at a later time, like once the user has clicked a button.

Incoming actions that are associated with a function have the same `inputs`, `complete`, and `fail` utilities as offered by the `function()` method.

To learn more about responding to interactivity, see the [Slack API documentation](https://api.slack.com/automation/functions/custom-bolt#interactivity).

```js
// If associated with a function, function-specific utilities are made available 
app.action('approve_button', async ({ complete, fail }) => {
  // Signal the function has completed once the button is clicked  
  await complete({ outputs: { message: 'Request approved 👍' } });
});
```