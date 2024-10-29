---
title: Steps from Apps
lang: en
slug: /concepts/steps-from-apps
---

:::danger

Steps from Apps is a deprecated feature.

Steps from Apps are different than, and not interchangeable with, Slack automation workflows. We encourage those who are currently publishing steps from apps to consider the new [Slack automation features](https://api.slack.com/automation), such as [custom steps for Bolt](https://api.slack.com/automation/functions/custom-bolt).

Please [read the Slack API changelog entry](https://api.slack.com/changelog/2023-08-workflow-steps-from-apps-step-back) for more information.

:::

Steps from apps allow your app to create and process steps that users can add using [Workflow Builder](https://api.slack.com/workflows).

A step from app is made up of three distinct user events:

- Adding or editing the step in a Workflow
- Saving or updating the step's configuration
- The end user's execution of the step

All three events must be handled for a step from app to function.

Read more about steps from apps in the [API documentation](https://api.slack.com/legacy/workflows/steps).

---

## Creating steps from apps 

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

## Adding or editing steps from apps

When a builder adds (or later edits) your step in their workflow, your app will receive a [`workflow_step_edit` event](https://api.slack.com/reference/workflows/workflow_step_edit). The `edit` callback in your `WorkflowStep` configuration will be run when this event is received.

Whether a builder is adding or editing a step, you need to send them a [step from app configuration modal](https://api.slack.com/reference/workflows/configuration-view). This modal is where step-specific settings are chosen, and it has more restrictions than typical modals—most notably, it cannot include `title​`, `submit​`, or `close`​ properties. By default, the configuration modal's `callback_id` will be the same as the step from app.

Within the `edit` callback, the `configure()` utility can be used to easily open your step's configuration modal by passing in an object with your view's `blocks`. To disable saving the configuration before certain conditions are met, pass in `submit_disabled` with a value of `true`.

To learn more about opening configuration modals, [read the documentation](https://api.slack.com/workflows/steps#handle_config_view).

```javascript
const ws = new WorkflowStep('add_task', {
  edit: async ({ ack, step, configure }) => {
    await ack();

    const blocks = [
      {
        type: 'input',
        block_id: 'task_name_input',
        element: {
          type: 'plain_text_input',
          action_id: 'name',
          placeholder: {
            type: 'plain_text',
            text: 'Add a task name',
          },
        },
        label: {
          type: 'plain_text',
          text: 'Task name',
        },
      },
      {
        type: 'input',
        block_id: 'task_description_input',
        element: {
          type: 'plain_text_input',
          action_id: 'description',
          placeholder: {
            type: 'plain_text',
            text: 'Add a task description',
          },
        },
        label: {
          type: 'plain_text',
          text: 'Task description',
        },
      },
    ];

    await configure({ blocks });
  },
  save: async ({ ack, step, update }) => {},
  execute: async ({ step, complete, fail }) => {},
});
```

## Saving step configurations

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

## Executing steps from apps

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
