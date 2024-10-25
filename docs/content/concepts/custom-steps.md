---
title: Custom Steps
lang: en
slug: /concepts/custom-steps
---

Your app can use the `function()` method to listen to incoming [custom step requests](https://api.slack.com/automation/functions/custom-bolt). Custom steps are used in Workflow Builder to build workflows. The method requires a step `callback_id` of type string. This `callback_id` must also be defined in your [Function](https://api.slack.com/concepts/manifests#functions) definition. Custom steps must be finalized using the `complete()` or `fail()` listener arguments to notify Slack that your app has processed the request.

* `complete()` requires one argument: an `outputs` object. It ends your custom step **successfully** and provides an object containing the outputs of your custom step as per its definition.
* `fail()` requires **one** argument: `error` of type string. It ends your custom step **unsuccessfully** and provides a message containing information regarding why your custom step failed.

You can reference your custom step's inputs using the `inputs` listener argument.

```js
// This sample custom step formats an input and outputs it
app.function('sample_custom_step', async ({ inputs, complete, fail, logger }) => {
  try {
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
Example app manifest definition
</summary>

```json
...
"functions": {
    "sample_custom_step": {
        "title": "Sample custom step",
        "description": "Run a sample custom step",
        "input_parameters": {
            "message": {
                "type": "string",
                "title": "Message",
                "description": "A message to be formatted by a custom step",
                "is_required": true,
            }
        },
        "output_parameters": {
            "message": {
                "type": "string",
                "title": "Messge",
                "description": "A formatted message",
                "is_required": true,
            }
        }
    }
}
```

</details>

---

## Listening to custom step interactivity events

Your app's custom steps may create interactivity points for users, for example: Post a message with a button

If such interaction points originate from a custom step execution, the events sent to your app representing the end-user interaction with these points are considered to be _function-scoped interactivity events_. These interactivity events can be handled by your app using the same concepts we covered earlier, such as [Listening to actions](/concepts/action-listening).

_function-scoped interactivity events_ will contain data related to the custom step (`function_executed` event) they were spawned from, such as custom step `inputs` and access to `complete()` and `fail()` listener arguments.

Your app can skip calling `complete()` or `fail()` in the `function()` handler method if the custom step creates an interaction point that requires user interaction before the step can end. However, in the relevant interactivity handler method, your app must invoke `complete()` or `fail()` to notify Slack that the custom step has been processed.

You’ll notice in all interactivity handler examples, `ack()` is used. It is required to call the `ack()` function within an interactivity listener to acknowledge that the request was received from Slack. This is discussed in the [acknowledging requests section](/concepts/acknowledge).

```js
/** This sample custom step posts a message with a button */
app.function('custom_step_button', async ({ client, inputs, fail, logger }) => {
  try {
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

<details>
<summary>
Example app manifest definition
</summary>

```json
...
"functions": {
    "custom_step_button": {
        "title": "Custom step with a button",
        "description": "Custom step that waits for a button click",
        "input_parameters": {
            "user_id": {
                "type": "slack#/types/user_id",
                "title": "User",
                "description": "The recipient of a message with a button",
                "is_required": true,
            }
        },
        "output_parameters": {
            "user_id": {
                "type": "slack#/types/user_id",
                "title": "User",
                "description": "The user that completed the function",
                "is_required": true
            }
        }
    }
}
```

</details>

Learn more about responding to interactivity, see the [Slack API documentation](https://api.slack.com/automation/functions/custom-bolt#interactivity).
