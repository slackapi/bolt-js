---
title: Executing workflow steps
lang: en
slug: executing-steps
order: 3
beta: true
---

<div class="section-content">

When your workflow is executed by an end user, your app will receive a `workflow_step_execute` event. This event includes the user's `inputs` and a unique workflow execution ID. Your app must either call [`workflows.stepCompleted`](https://api.slack.com/methods/workflows.stepCompleted) with the `outputs` you specified in `workflows.updateStep`, or [`workflows.stepFailed`](https://api.slack.com/methods/workflows.stepFailed) to indicate the step failed.
</div>

```javascript
app.event('workflow_step_execute', async ({ event, client }) => {
  // Unique workflow edit ID
  let workflowExecuteId = event.workflow_step.workflow_step_execute_id;
  let inputs = event.workflow_step.inputs;

  client.workflows.stepCompleted({
    workflow_step_execute_id: workflowExecuteId,
    outputs: {
      taskName: inputs.taskName.value,
      taskDescription: inputs.taskDescription.value
    }
  });
  
  // You can do anything else you want here. Some ideas:
  // Display results on the user's home tab, update your database, or send a message into a channel
});
```