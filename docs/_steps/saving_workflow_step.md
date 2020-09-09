---
title: Saving the step configuration
lang: en
slug: saving-steps
order: 4
---

<div class='section-content'>

When the workflow step's configuration has been saved (using the step configuration modal from the `edit` callback), your app will listen for the `view_submission` event. The method assigned to the `save` property of the `WorkflowStep` configuration object passed in during instantiation will run when this event occurs.

Once the configuration for the workflow step has been determined, builders often use that configuration to craft the custom outputs and behavior that occurs when the end user executes the step.

Within the `save` callback, the `update()` method can be used to save the builder's step configuration by passing in the following arguments: `inputs`, `outputs`, `step_name` and `step_image_url`.

`inputs` is an object representing the data your app expects to receive from the user upon workflow step execution. To use variables that were collected earlier in the workflow, you can include handlebar-style syntax (`{{ variable }}`). During the workflow step's execution, those variables will be replaced with their actual runtime value.

`outputs` is an array of objects containing data that your app will provide upon the workflow step's completion. Outputs can then be used in subsequent steps of the workflow.

`step_name` and `step_image_url` are available for a more customized look and feel of your workflow step.

To learn more about how to structure these parameters, [read the documentation](https://api.slack.com/reference/workflows/workflow_step).

</div>

```javascript
const ws = new WorkflowStep('add_task', {
  edit: async ({ ack, step, configure }) => {},
  save: async ({ ack, step, update }) => {
    await ack();

    const { values } = view.state;
    const taskName = values.task_name_input.name;
    const taskDescription = values.task_description_input.description;
                
    const inputs = {
      taskName: { value: taskName },
      taskDescription: { value: taskDescription }
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