---
title: Handling errors
lang: en
slug: error-handling
order: 1
---

<div class="section-content">
*Note: Since v2, error handling has improved! View the [migration guide for V2](https://slack.dev/bolt/tutorial/migration-v2) to learn about the changes.*

If an error occurs in a listener, it’s recommended you handle it directly with a `try`/`catch`. However, there still may be cases where errors slip through the cracks. By default, these errors will be logged to the console. To handle them yourself, you can attach a global error handler to your app with the `app.error(fn)` method.
</div>

```javascript
app.error((error) => {
  // Check the details of the error to handle cases where you should retry sending a message or stop the app
  console.error(error);
});
```
