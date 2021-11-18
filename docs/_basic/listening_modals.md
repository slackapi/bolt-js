---
title: Listening for view changes
lang: en
slug: view-submissions
order: 12
---

<div class="section-content">

If a <a href="https://api.slack.com/reference/block-kit/views">view payload</a> contains any input blocks, you must listen to `view_submission` requests to receive their values.
If the `notify_on_close` flag of a view is active, an respective event is sent when a view has been closed.
To listen to either a `view_submission` request or `view_closed` event, you can use the built-in `view()` method.

`view()` requires a `callback_id` of type `string` or `RegExp` or a constraint object with properties `type` and `callback_id`. 

---

##### Update views on submission

You can access the value of the input blocks by accessing the `state` object. `state` contains a values object that uses the `block_id` and unique `action_id` to store the input values.
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
Similarly, there are options for [displaying errors](https://api.slack.com/surfaces/modals/using#displaying_errors) in response to view submissions.

Read more about view submissions in our <a href="https://api.slack.com/surfaces/modals/using#interactions">API documentation</a>.
</div>

```javascript
// Handle a view_submission request
app.view('view_b', async ({ ack, body, view, client }) => {
  // Acknowledge the view_submission request
  await ack();

  // Do whatever you want with the input data - here we're saving it to a DB then sending the user a verifcation of their submission

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
    console.error(error);
  }

});
```

---

##### handle view closed events

The built-in `view()` method can also handle `view_closed` events, which are sent when a <a href="https://api.slack.com/reference/block-kit/views">view payload</a> has the `notify_on_close` flag set.
The event contains the respective `callback_id` of the closed view.
Please note that you have to specify the `type: 'view_closed'` in the constraint object explicitly, since otherwise the handler is not triggered.

See the <a href="https://api.slack.com/surfaces/modals/using#modal_cancellations">API documentation</a> for more information about the view closed event.

```javascript
// Handle a view_canceled event
app.view({ type: 'view_closed', callback_id: 'view_b' }, async ({ ack, body, view, client }) => {
  // Acknowledge the view_closed event
  await ack();

  // react on close event
});
```