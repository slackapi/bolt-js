---
title: Responding to events
slug: event-responding
order: 5
---

<div class="section-content">
The easiest way to respond to events is using the `say` function, which exists in any listener middleware function when a channel exists in the event payload. The `say` function accepts a message payload of type string for simple text responses, and of type object for more complex responses.
</div>

```javascript
// app_home_opened is triggered when a user opens your App's DM
app.event('app_home_opened', async ({ event, say }) => {
  say(`Hi <@${event.user.id}> :wave: If you've never used me before you can type 'help' to see all of my features`);
});
```
