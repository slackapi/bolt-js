---
title: Listening and responding to custom steps
lang: en
slug: /concepts/custom-steps
---

Your app can use the `function()` method to listen to incoming [custom step requests](https://api.slack.com/automation/functions/custom-bolt). Custom steps are used in Workflow Builder to build workflows. The method requires a step `callback_id` of type string. This `callback_id` must also be defined in your [Function](https://api.slack.com/concepts/manifests#functions) definition. Custom steps must be finalized using the `complete()` or `fail()` listener arguments to notify Slack that your app has processed the request.

* `complete()` requires one argument: an `outputs` object. It completes your custom step **successfully** and provides an object containing the outputs of your custom step as per its definition.
* `fail()` requires **one** argument: `error` of type string. It completes your custom step **unsuccessfully** and provides a message containing information regarding why your custom step failed.

You can reference your custom step's inputs using the `inputs` listener argument.

```js
// This sample custom step formats an input and outputs it
app.function('sample_custom_step', async ({ ack, inputs, complete, fail, logger }) => {
  try {
    await ack();
    const { message } = inputs;

    await complete({
        outputs: { 
            message: `:wave: You submitted the following message: \n\n>${message}` 
        }
    });
  } catch (error) {
    logger.error(error);
    await fail({ error: `Failed to handle a function request: ${error}` });
  }
});
```

<details>
  <summary>
  Listening to custom step interactivity events
  </summary>
  Your app can listen to user actions, like button clicks, created from `custom steps` using the `action` method.
  
  Actions can be filtered on an `action_id` of type string or RegExp object. `action_id`s act as unique identifiers for interactive components on the Slack platform.

  Your app can skip calling `complete()` or `fail()` in the `function()` listener if the custom step creates an interaction point that requires user interaction before the step can complete. However, in the relevant interactivity handler method, your app must invoke `complete()` or `fail()` to notify Slack that the custom step has been processed.

  You’ll notice in all interactivity handler examples, `ack()` is used. It is required to call the `ack()` function within an interactivity listener to acknowledge that the request was received from Slack. This is discussed in the [acknowledging requests section](/concepts/acknowledge).

```js
/** This sample custom step posts a message with a button */
app.function('sample_function', async ({ ack, client, inputs, fail, logger }) => {
  try {
    await ack();
    const { user_id } = inputs;

    await client.chat.postMessage({
      channel: user_id,
      text: 'Click the button to signal the function has completed',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Click the button to signal the function has completed',
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Complete function',
            },
            action_id: 'sample_button',
          },
        },
      ],
    });
  } catch (error) {
    logger.error(error);
    await fail({ error: `Failed to handle a function request: ${error}` });
  }
});

/** Your listener will be called every time a block element with the action_id "sample_button" is triggered */
app.action('sample_button', async ({ ack, body, client, complete, fail, logger }) => {
  try {
    await ack();

    const { channel, message, user } = body;
    // Functions should be marked as successfully completed using `complete` or
    // as having failed using `fail`, else they'll remain in an 'In progress' state.
    await complete({ outputs: { user_id: user.id } });

    await client.chat.update({
      channel: channel.id,
      ts: message.ts,
      text: 'Function completed successfully!',
    });
  } catch (error) {
    logger.error(error);
    await fail({ error: `Failed to handle a function request: ${error}` });
  }
});
```

Learn more about responding to interactivity, see the [Slack API documentation](https://api.slack.com/automation/functions/custom-bolt#interactivity).

</details>
