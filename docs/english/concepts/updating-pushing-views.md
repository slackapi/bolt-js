---
title: Updating & pushing views
lang: en
slug: /concepts/updating-pushing-views
---

Modals contain a stack of views. When you call the [`views.open`](https://docs.slack.dev/reference/methods/views.open/) method, you add the root view to the modal. After the initial call, you can dynamically update a view by calling the [`views.update`](https://docs.slack.dev/reference/methods/views.update) method, or stack a new view on top of the root view by calling the [`views.push`](https://docs.slack.dev/reference/methods/views.push) method.

## The `views.update` method

To update a view, you can use the built-in client to call the `views.update` method with the `view_id` parameter that was generated when you opened the view, and a new `view` object including the updated `blocks` array. If you're updating the view when a user interacts with an element inside of an existing view, the `view_id` parameter will be available in the `body` of the request.

## The `views.push` method

To push a new view onto the view stack, you can use the built-in client to call the `views.push` method by passing a valid `trigger_id` parameter and a new [view payload](https://docs.slack.dev/reference/views). The arguments for the `views.push` method is the same as [`views.open`](/concepts/creating-modals). After you open a modal, you may only push two additional views onto the view stack.

Learn more about updating and pushing views in our [API documentation](https://docs.slack.dev/surfaces/modals)

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