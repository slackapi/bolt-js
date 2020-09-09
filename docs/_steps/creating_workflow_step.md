---
title: Creating a workflow step
lang: en
slug: creating-steps
order: 2
---

<div class='section-content'>

To create a new workflow step, Bolt provides the `WorkflowStep` class.

When instantiating a new `WorkflowStep`, pass in the step's `callback_id`, which is defined in your app configuration, and a step configuration object.

The configuration object for a `WorkflowStep` contains three properties: `edit`, `save`, and `execute`. Each of these properties must either hold a value of a single callback or an array of callbacks. All callbacks have access to a `step` object that contains information about the workflow step event, as well as one or more utility functions.

After instantiating your workflow step, pass it the instance into `app.step()`. Behind the scenes, your app will listen and respond to the workflow step’s events using the callbacks provided in the configuration object.

</div>

```javascript
const { WorkflowStep } = require('@slack/bolt');

const ws = new WorkflowStep('add_task', {
  edit: async ({ ack, step, configure }) => {},
  save: async ({ ack, step, update }) => {},
  execute: async ({ step, complete, fail }) => {},
});

app.step(ws);
```
