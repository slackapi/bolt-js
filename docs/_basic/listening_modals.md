---
title: Listening for view submissions
lang: en
slug: view_submissions
order: 11
---

<div class="section-content">
If a <a href="https://api.slack.com/reference/block-kit/views">view payload</a> contains any input blocks, you must listen to <code>view_submission</code> events to receive their values. To listen to <code>view_submission</code> events, you can use the built-in <code>view()</code> method.

<code>view()</code> requires a <code>callback_id</code> of type <code>string</code> or <code>RegExp</code>.

You can access the value of the <code>input</code> blocks by accessing the <code>state</code> object. <code>state</code> contains a <code>values</code> object that uses the <code>block_id</code> and unique <code>action_id</code> to store the input values.

Read more about view submissions in our <a href="https://api.slack.com/surfaces/modals/using#interactions">API documentation</a>.
</div>

```javascript
// Handle a view_submission event
app.view('view_b', async ({ ack, body, view, context }) => {
  // Acknowledge the view_submission event
  ack();

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
    app.client.chat.postMessage({
      token: context.botToken,
      channel: user,
      text: msg
    });
  }
  catch (error) {
    console.error(error);
  }
  
});
```
