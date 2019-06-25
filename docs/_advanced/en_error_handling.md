---
title: Handling errors
lang: en
slug: error-handling
order: 1
---

<div class="section-content">
If an error occurs in a listener, it’s recommended you handle it directly. However, there are cases where errors may be triggered after your listener has already returned (such as in `say()`, `respond()`, or if you don't call `ack()` when it's required). By default, these errors will be logged to the console. To handle them yourself, you can attach a global error handler to your app with the `error(fn)` method.

If you want more control over errors, it’s advised to use the [`chat.postMessage`](https://api.slack.com/methods/chat.postMessage) method attached to your app under the `client` key (instead of `say()` or `respond()`). This returns a `Promise` that can be caught to handle the error.
</div>

```javascript
app.error((error) => {
	// Check the details of the error to handle cases where you should retry sending a message or stop the app
	console.error(error);
});
```