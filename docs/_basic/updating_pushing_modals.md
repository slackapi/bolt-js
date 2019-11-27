---
title: Updating and pushing views
lang: en
slug: updating-pushing-views
order: 10
---

<div class="section-content">
Modals contain a stack of views. When you call <a href="https://api.slack.com/methods/views.open">`views.open`</a>, you add the root view to the modal. After the initial call, you can dynamically update a view by calling <a href="https://api.slack.com/methods/views.update">`views.update`</a>, or stack a new view on top of the root view by calling <a href="https://api.slack.com/methods/views.push">`views.push`</a>.

<strong><code>views.update</code></strong><br>
To update a view, you can use the built-in client to call <code>views.update</code> with the <code>view_id</code> that was generated when you opened the view, and the updated <code>blocks</code> array. If you're updating the view when a user interacts with an element inside of an existing view, the <code>view_id</code> will be available in the <code>body</code> of the request.

<strong><code>views.push</code></strong><br>
To push a new view onto the view stack, you can use the built-in client to call <code>views.push</code> with a valid <code>trigger_id</code> a new <a href="https://api.slack.com/reference/block-kit/views">view payload</a>. The arguments for `views.push` is the same as <a href="#creating-modals">opening modals</a>. After you open a modal, you may only push two additional views onto the view stack.

Learn more about updating and pushing views in our <a href="https://api.slack.com/surfaces/modals/using#modifying">API documentation</a>.
</div>

```javascript
// Listen for a button invocation with action_id `button_abc` (assume it's inside of a modal)
app.action('button_abc', ({ ack, body, context }) => {
  // Acknowledge the button request
  ack();

  try {
    const result = app.client.views.update({
      token: context.botToken,
      // Pass the view_id
      view_id: body.view.id,
      // View payload with updated blocks
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Updated modal'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'You updated the modal!'
            }
          },
          {
            type: 'image',
            image_url: 'https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif',
            alt_text: 'Yay! The modal was updated'
          }
        ]
      }
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});
```
