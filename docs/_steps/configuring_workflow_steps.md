---
title: Configuring and updating workflow steps
lang: en
slug: configuring-steps
order: 2
beta: true
---
{% raw %} 
<div class='section-content'>
When a builder is adding your step to a new or existing workflow, your app will need to configure and update that step:

**1. Listening for `workflow_step_edit` action**

When a builder initially adds (or later edits) your step in their workflow, your app will receive a `workflow_step_edit` action. Your app can listen to `workflow_step_edit` using `action()` and the `callback_id` in your app's configuration.

**2. Opening and listening to configuration modal**

The `workflow_step_edit` action will contain a `trigger_id` which your app will use to call `views.open` to open a modal of type `workflow_step`. This configuration modal has more restrictions than typical modals—most notably you cannot include `title`, `submit`, or `close` properties in the payload.

To learn more about configuration modals, [read the documentation](https://api.slack.com/workflows/steps#handle_config_view).

Similar to other modals, your app can listen to this `view_submission` payload with the built-in [`views()` method](#view_submissions).

**3. Updating the builder's workflow**

After your app listens to the `view_submission`, you'll call [`workflows.updateStep`](https://api.slack.com/methods/workflows.updateStep) with the unique `workflow_step_id` (found in the `body`'s `workflow_step` object) to save the configuration for that builder's specific workflow. Two important parameters:
- `inputs` is an object with keyed child objects representing the data your app expects to receive from the user upon workflow step execution. You can include handlebar-style syntax (`{{ variable }}`) for variables that are collected earlier in a workflow.
- `outputs` is an array of objects indicating the data your app will provide upon workflow step completion.

Read the documentation for [`input` objects](https://api.slack.com/reference/workflows/workflow_step#input) and [`output` objects](https://api.slack.com/reference/workflows/workflow_step#output) to learn more about how to structure these parameters.

</div>
{% endraw %} 

```javascript
// Your app will be called when user adds your step to their workflow
app.action({ type: 'workflow_step_edit', callback_id: 'add_task' }, async ({ body, ack, client }) => {
  // Acknowledge the event
  ack();
  // Open the configuration modal using `views.open`
  client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'workflow_step',
      // callback_id to listen to view_submission
      callback_id: 'add_task_config',
      blocks: [
        // Input blocks will allow users to pass variables from a previous step to your's
        { 'type': 'input',
          'block_id': 'task_name_input',
          'element': {
            'type': 'plain_text_input',
            'action_id': 'name',
            'placeholder': {
              'type': 'plain_text',
              'text': 'Add a task name'
            }
          },
          'label': {
            'type': 'plain_text',
            'text': 'Task name'
          }
        },
        { 'type': 'input',
          'block_id': 'task_description_input',
          'element': {
            'type': 'plain_text_input',
            'action_id': 'description',
            'placeholder': {
              'type': 'plain_text',
              'text': 'Add a task description'
            }
          },
          'label': {
            'type': 'plain_text',
            'text': 'Task description'
          }
        }
      ]
    }
  });
});

app.views('add_task_config', async ({ ack, view, body, client }) => {
  // Acknowledge the submission
  ack();
  // Unique workflow edit ID
  let workflowEditId = body.workflow_step.workflow_step_edit_id;
  // Input values found in the view's state object
  let taskName = view.state.values.task_name_input.name;
  let taskDescription = view.state.values.task_description_input.description;

  client.workflows.updateStep({
    workflow_step_edit_id: workflowEditId,
    inputs: {
      taskName: { value: (taskName || '') },
      taskDescription: { value: (taskDescription || '') }
    },
    outputs: [
      {
        name: 'taskName',
        type: 'text',
        label: 'Task name',
      },
      {
        name: 'taskDescription',
        type: 'text',
        label: 'Task description',
      }
    ]
  });
```