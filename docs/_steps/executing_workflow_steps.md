---
title: Executing workflow steps
lang: en
slug: executing-steps
order: 5
beta: true
---

<div class="section-content">

When your workflow step is executed by an end user, your app will receive a `workflow_step_execute` event. The method assigned to the `execute` property of the `WorkflowStep` configuration object passed in during instantiation will run when this event occurs.

Using the `inputs` from the configuration modal submission in the `save` callback, this is where we make third-party API calls, save things to a database, update the end user's Home Tab, and/or decide what outputs will be available to subsequent workflow steps by mapping values to the `outputs` object.

Within the `execute` callback, your app must either call `complete()` to indicate that the step's execution was successful, or `fail()` to indicate that the step's execution failed.

</div>

```javascript
const ws = new WorkflowStep('add_task', {
  edit: async ({ ack, step, configure }) => {},
  save: async ({ ack, step, update }) => {},
  execute: async ({ step, complete, fail }) => {
    const { inputs } = step;

    const outputs = {
      taskName: inputs.taskName.value.value,
      taskDescription: inputs.taskDescription.value.value,
    };

    // if everything was successful
    await complete({ outputs });

    // if something went wrong
    // fail({ error: { message: "Just testing step failure!" } });
  },
});
```