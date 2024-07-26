---
title: Listening to custom function executions
lang: en
slug: /concepts/listening-to-custom-functions
---

When your custom function is executed as a step in a workflow, your app will receive a `function_executed` event. The callback provided to the `function()` method will be run when this event is received.

The callback is where you can access `inputs`, make third-party API calls, or set the output values that will be available to subsequent workflow steps by mapping values to the `outputs` object.

Your app can call `complete()` to indicate that the function’s execution was successful, or `fail()` to signal that the function failed to complete.

To learn more about listening to custom function executions, see the [Slack API documentation](https://api.slack.com/automation/functions/custom-bolt#listener).

```js
app.function('sample_function', async ({ client, inputs, fail }) => {
  try {
    const { user_id } = inputs;
    await complete({ outputs: { user_id } });
  } catch (error) {
    console.error(error);
    fail({ error: `Failed to handle a function request: ${error}` });
  }
});
```