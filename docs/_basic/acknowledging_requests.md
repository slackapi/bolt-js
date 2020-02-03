---
title: Acknowledging events
lang: en
slug: acknowledge
order: 7
---

<div class="section-content">
Actions, commands, and options events must **always** be acknowledged using the `ack()` function. This lets Slack know that the event was received and updates the Slack user interface accordingly. Depending on the type of event, your acknowledgement may be different. For example, when acknowledging a dialog submission you will call `ack()` with validation errors if the submission contains errors, or with no parameters if the submission is valid.

We recommend calling `ack()` right away before sending a new message or fetching information from your database since you only have 3 seconds to respond.
</div>

```javascript
// Regex to determine if this is a valid email
let isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
// This uses a constraint object to listen for dialog submissions with a callback_id of ticket_submit 
app.action({ callback_id: 'ticket_submit' }, async ({ action, ack }) => {
  // it’s a valid email, accept the submission
  if (isEmail.test(action.submission.email)) {
    await ack();
  } else {
    // if it isn’t a valid email, acknowledge with an error
    await ack({
      errors: [{
        "name": "email_address",
        "error": "Sorry, this isn’t a valid email"
      }]
    });
  }
});
```
