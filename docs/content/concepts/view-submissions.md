---
title: Listening to views
lang: en
slug: /concepts/view-submissions
---

You may listen for user interactions with views using the `view` method. 

Slack will send a `view_submission` request when a user submits a view. To receive the values submitted in view input blocks, you can access the `state` object. `state` contains a `values` object that uses the `block_id` and unique `action_id` to store the input values.
If the `notify_on_close` field of a view has been set to `true`, Slack will also send a `view_closed` request if a user clicks the close button. See the section on **Handling views on close** for more detail.
To listen to either a `view_submission` request or `view_closed` request, you can use the built-in `view()` method.

The `view()` method requires a `callback_id` of type `string` or `RegExp` or a constraint object with properties `type` and `callback_id`. 

---

## Update views on submission

To update a view in response to a `view_submission` request, you may pass a `response_action` of type `update` with a newly composed `view` to display in your acknowledgement.

```javascript
// Update the view on submission 
app.view('modal-callback-id', async ({ ack, body }) => {
  await ack({
    response_action: 'update',
    view: buildNewModalView(body),
  });
});
```
Similarly, there are options for [displaying errors](https://docs.slack.dev/surfaces/modals#displaying_errors) in response to view submissions.

Read more about view submissions in our [API documentation](https://docs.slack.dev/surfaces/modals#interactions).

---

## Handling views on close

When listening for `view_closed` requests, you must pass an object containing `type: 'view_closed'` and the view `callback_id`. See below for an example of this.

:::tip 
See the [API documentation](https://docs.slack.dev/surfaces/modals#interactions) for more information about `view_closed`.
:::

#### Handle a `view_closed` request

```javascript
// Handle a view_closed request
app.view({ callback_id: 'view_b', type: 'view_closed' }, async ({ ack, body, view, client }) => {
  // Acknowledge the view_closed request
  await ack();
  // react on close request
});
```

#### Handle a `view_submission` request

```javascript
// Handle a view_submission request
app.view('view_b', async ({ ack, body, view, client, logger }) => {
  // Acknowledge the view_submission request
  await ack();

  // Do whatever you want with the input data - here we're saving it to a DB then sending the user a verification of their submission

  // Assume there's an input block with `block_1` as the block_id and `input_a`
  const val = view['state']['values']['block_1']['input_a'];
  const user = body['user']['id'];

  // Message to send user
  let msg = '';
  // Save to DB
  const results = await db.set(user.input, val);

  if (results) {
    // DB save was successful
    msg = 'Your submission was successful';
  } else {
    msg = 'There was an error with your submission';
  }

  // Message the user
  try {
    await client.chat.postMessage({
      channel: user,
      text: msg
    });
  }
  catch (error) {
    logger.error(error);
  }

});
```