---
title: Listening to messages
tags: message event listen
slug: listening-messages
---

<div class="section_content">
To listen to messages that your app has access to receive, you can use the `message()` method. This method adds listener middleware that filters out any events that aren’t of type `message`.

It accepts an optional `pattern` parameter of type `string` or `RegExp` object that will filter out any messages that don’t match.
</div>

```javascript
// This will match any message that contains 👋
app.message(':wave:', async ({ message, say}) => {
  say(`Hello, <@${message.user}>`);
});
```
