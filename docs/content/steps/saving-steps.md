---
title: Saving step configurations
lang: en
slug: /concepts/saving-steps
---

:::danger

Steps from Apps are a deprecated feature.

Steps from Apps are different than, and not interchangeable with, Slack automation workflows. We encourage those who are currently publishing steps from apps to consider the new [Slack automation features](https://api.slack.com/automation), such as [custom steps for Bolt](https://api.slack.com/automation/functions/custom-bolt).

Please [read the Slack API changelog entry](https://api.slack.com/changelog/2023-08-workflow-steps-from-apps-step-back) for more information.

:::

After the configuration modal is opened, your app will listen for the `view_submission` event. The `save` callback in your `WorkflowStep` configuration will be run when this event is received.

Within the `save` callback, the `update()` method can be used to save the builder's step configuration by passing in the following arguments:

- `inputs` is an object representing the data your app expects to receive from the user upon step from app execution.
- `outputs` is an array of objects containing data that your app will provide upon the step's completion. Outputs can then be used in subsequent steps of the workflow.
- `step_name` overrides the default Step name
- `step_image_url` overrides the default Step image

To learn more about how to structure these parameters, [read the documentation](https://api.slack.com/reference/workflows/workflow_step).

```javascript
const ws = new WorkflowStep('add_task', {
  edit: async ({ ack, step, configure }) => {},
  save: async ({ ack, step, view, update }) => {
    await ack();

    const { values } = view.state;
    const taskName = values.task_name_input.name;
    const taskDescription = values.task_description_input.description;
                
    const inputs = {
      taskName: { value: taskName.value },
      taskDescription: { value: taskDescription.value }
    };

    const outputs = [
      {
        type: 'text',
        name: 'taskName',
        label: 'Task name',
      },
      {
        type: 'text',
        name: 'taskDescription',
        label: 'Task description',
      }
    ];

    await update({ inputs, outputs });
  },
  execute: async ({ step, complete, fail }) => {},
});
```
