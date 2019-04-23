---
title: Handling errors
slug: error-handling
order: 1
---

<div class="section-content">
If an error occurs in a listener middleware, it’s recommended you handle it directly. However, there are cases where errors may occur after your listener middleware has returned (like `say()` and `respond()`, or not calling `ack()`). By default, these errors will be logged to the console. To handle them yourself, you can attach a global error handler to your app using the `App.prototype.error(fn)` method.

If you want more control over errors, it’s advised to use the [`chat.postMessage`](https://api.slack.com/methods/chat.postMessage) method attached to your app under the `client` key. This returns a `Promise` that can be caught to handle the error.
</div>

```javascript
app.error((error) => {
	// Check the details of the error to handle cases where you should retry sending a message or stop the app
	console.error(error);
});
```