---
title: Configuring and updating workflow steps
lang: en
slug: configuring-steps
order: 10
beta: true
---
{% raw %} 
<div class='section-content'>
⚠️ Workflow [steps from apps](https://api.slack.com/workflows/steps) is a beta feature. As the feature is developed, **Bolt for JavaScript's API will change to add better native support.**

When a builder is adding your step to a new or existing workflow, your app will need to configure and update that step:

**1. Listening for `workflow_step_edit` action**

When the builder initially adds your step to their workflow, your app will receive a `workflow_step_edit` action. Your app can listen to `workflow_step_edit` using `action()` and the `callback_id` in your app's configuration.

**2. Opening and listening to configuration modal**

The `workflow_step_edit` action will contain a `trigger_id`. Your app will call `views.open` with this `trigger_id` to open a modal of type `workflow_step`. This modal has more restrictions than typical modals–most notably you cannot include `title`, `submit`, or `close` properties in the payload.

Similar to other modals, your app can listen to this `view_submission` payload with the built-in [`views()` method](#view_submissions).

To learn more about configuration modals, [read the documentation](https://api.slack.com/workflows/steps#handle_config_view).

**3. Updating the builder's workflow**

After your app listens to the `view_submission`, you'll call [`workflows.updateStep`](https://api.slack.com/methods/workflows.updateStep) with the unique `workflow_step_id` (found in the `body`'s `workflow_step` object) to save the configuration for that builder's specific workflow. Two important parameters:
- `input` indicates the data your app expects to receive from the user when the workflow step is executed. You can include handlebar-style syntax (`{{ variable }}`) for variables that are collected earlier in a workflow.
- `output` indicates the data your app will provide upon completion.

Read the documentation [for `input`](https://api.slack.com/reference/workflows/workflow_step#input) and [for `output`](https://api.slack.com/reference/workflows/workflow_step#output) to learn more.

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