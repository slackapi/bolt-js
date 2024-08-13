---
title: Creating steps from apps 
lang: en
slug: /concepts/creating-steps
---

:::danger

Steps from apps are a deprecated feature.

Steps from apps are different than, and not interchangable with, Slack automation workflows. We encourage those who are currently publishing steps from apps to consider the new [Slack automation features](https://api.slack.com/automation), such as [custom steps for Bolt](/concepts/creating-custom-functions).

Please [read the Slack API changelog entry](https://api.slack.com/changelog/2023-08-workflow-steps-from-apps-step-back) for more information.

:::

To create a step from app, Bolt provides the `WorkflowStep` class.

When instantiating a new `WorkflowStep`, pass in the step's `callback_id` and a configuration object.

The configuration object contains three properties: `edit`, `save`, and `execute`. Each of these properties must be a single callback or an array of callbacks. All callbacks have access to a `step` object that contains information about the step from app event.

After instantiating a `WorkflowStep`, you can pass it into `app.step()`. Behind the scenes, your app will listen and respond to the step’s events using the callbacks provided in the configuration object.

```javascript
const { App, WorkflowStep } = require('@slack/bolt');

// Initiate the Bolt app as you normally would
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

// Create a new WorkflowStep instance
const ws = new WorkflowStep('add_task', {
  edit: async ({ ack, step, configure }) => {},
  save: async ({ ack, step, update }) => {},
  execute: async ({ step, complete, fail }) => {},
});

app.step(ws);
```
