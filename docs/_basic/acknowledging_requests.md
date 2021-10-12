---
title: Acknowledging requests
lang: en
slug: acknowledge
order: 7
---

## Acknowledging requests

Actions, commands, and options requests must **always** be acknowledged using the `ack()` function. This lets Slack know that the request was received and updates the Slack user interface accordingly. Depending on the type of request, your acknowledgement may be different. For example, when acknowledging a modal submission you will call `ack()` with validation errors if the submission contains errors, or with no parameters if the submission is valid.

We recommend calling `ack()` right away before sending a new message or fetching information from your database since you only have 3 seconds to respond.

```javascript
// Regex to determine if this is a valid email
let isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
// This uses a constraint object to listen for modal submissions with a callback_id of ticket_submit 
app.view('ticket_submit', async ({ ack, view }) => {
  // get the email value from the input block with `email_address` as the block_id
  const email = view.state.values['email_address']['input_a'].value;

  // if it’s a valid email, accept the submission
  if (isEmail.test(email)) {
    await ack();
  } else {
    // if it isn’t a valid email, acknowledge with an error
    await ack({
      "response_action": "errors",
      errors: {
        "email_address": "Sorry, this isn’t a valid email"
      }
    });
  }
});
```