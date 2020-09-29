---
title: Executing workflow steps
lang: en
slug: executing-steps
order: 5
---

<div class="section-content">

When your workflow step is executed by an end user, your app will receive a [`workflow_step_execute` event](https://api.slack.com/events/workflow_step_execute). The `execute` callback in your `WorkflowStep` configuration will be run when this event is received.

Using the `inputs` from the `save` callback, this is where you can make third-party API calls, save information to a database, update the user's Home tab, or decide the outputs that will be available to subsequent workflow steps by mapping values to the `outputs` object.

Within the `execute` callback, your app must either call `complete()` to indicate that the step's execution was successful, or `fail()` to indicate that the step's execution failed.

</div>

```javascript
const ws = new WorkflowStep('add_task', {
  edit: async ({ ack, step, configure }) => {},
  save: async ({ ack, step, update }) => {},
  execute: async ({ step, complete, fail }) => {
    const { inputs } = step;

    const outputs = {
      taskName: inputs.taskName.value,
      taskDescription: inputs.taskDescription.value,
    };

    // if everything was successful
    await complete({ outputs });

    // if something went wrong
    // fail({ error: { message: "Just testing step failure!" } });
  },
});
```