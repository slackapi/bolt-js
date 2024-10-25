---
title: Updating and pushing views
lang: en
slug: /concepts/updating-pushing-views
---

Modals contain a stack of views. When you call [`views.open`](https://api.slack.com/methods/views.open), you add the root view to the modal. After the initial call, you can dynamically update a view by calling [`views.update`](https://api.slack.com/methods/views.update), or stack a new view on top of the root view by calling [`views.push`](https://api.slack.com/methods/views.push).

**`views.update`**

To update a view, you can use the built-in client to call `views.update` with the `view_id` that was generated when you opened the view, and a new `view` including the updated `blocks` array. If you're updating the view when a user interacts with an element inside of an existing view, the `view_id` will be available in the `body` of the request.

**`views.push`**

To push a new view onto the view stack, you can use the built-in client to call `views.push` with a valid `trigger_id` a new [view payload](https://api.slack.com/reference/block-kit/views). The arguments for `views.push` is the same as [opening modals](/concepts/creating-modals). After you open a modal, you may only push two additional views onto the view stack.

Learn more about updating and pushing views in our [API documentation](https://api.slack.com/surfaces/modals/using#modifying)

```javascript
// Listen for a button invocation with action_id `button_abc` (assume it's inside of a modal)
app.action('button_abc', async ({ ack, body, client, logger }) => {
  // Acknowledge the button request
  await ack();

  try {
    if (body.type !== 'block_actions' || !body.view) {
      return;
    }
    // Call views.update with the built-in client
    const result = await client.views.update({
      // Pass the view_id
      view_id: body.view.id,
      // Pass the current hash to avoid race conditions
      hash: body.view.hash,
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
    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});
```