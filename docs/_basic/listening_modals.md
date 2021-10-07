---
title: Listening for view submissions
lang: en
slug: view_submissions
order: 12
---

<div class="section-content">
If a <a href="https://api.slack.com/reference/block-kit/views">view payload</a> contains any input blocks, you must listen to `view_submission` requests to receive their values. To listen to `view_submission` requests, you can use the built-in `view()` method.

`view()` requires a `callback_id` of type `string` or `RegExp`.

You can access the value of the input blocks by accessing the `state` object. `state` contains a values object that uses the `block_id` and unique `action_id` to store the input values.

---

##### Update views on submission

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
