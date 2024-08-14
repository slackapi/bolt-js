---
title: Executing steps from apps
lang: en
slug: /concepts/executing-steps
---

:::danger

Steps from Apps are a deprecated feature.

Steps from Apps are different than, and not interchangeable with, Slack automation workflows. We encourage those who are currently publishing steps from apps to consider the new [Slack automation features](https://api.slack.com/automation), such as [custom steps for Bolt](https://api.slack.com/automation/functions/custom-bolt).

Please [read the Slack API changelog entry](https://api.slack.com/changelog/2023-08-workflow-steps-from-apps-step-back) for more information.

:::

When your step from app is executed by an end user, your app will receive a [`workflow_step_execute` event](https://api.slack.com/events/workflow_step_execute). The `execute` callback in your `WorkflowStep` configuration will be run when this event is received.

Using the `inputs` from the `save` callback, this is where you can make third-party API calls, save information to a database, update the user's Home tab, or decide the outputs that will be available to subsequent steps by mapping values to the `outputs` object.

Within the `execute` callback, your app must either call `complete()` to indicate that the step's execution was successful, or `fail()` to indicate that the step's execution failed.

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

    // signal back to Slack that everything was successful
    await complete({ outputs });
    // NOTE: If you run your app with processBeforeResponse: true option,
    // `await complete()` is not recommended because of the slow response of the API endpoint
    // which could result in not responding to the Slack Events API within the required 3 seconds
    // instead, use:
    // complete({ outputs }).then(() => { console.log('step from app execution complete registered'); });

    // let Slack know if something went wrong
    // await fail({ error: { message: "Just testing step failure!" } });
    // NOTE: If you run your app with processBeforeResponse: true, use this instead:
    // fail({ error: { message: "Just testing step failure!" } }).then(() => { console.log('step from app execution failure registered'); });
  },
});
```
