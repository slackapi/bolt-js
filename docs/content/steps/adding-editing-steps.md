---
title: Adding or editing steps from apps
lang: en
slug: /concepts/adding-editing-steps
---

:::danger

Steps from Apps are a deprecated feature.

Steps from Apps are different than, and not interchangable with, Slack automation workflows. We encourage those who are currently publishing steps from apps to consider the new [Slack automation features](https://api.slack.com/automation), such as [custom steps for Bolt](/concepts/creating-custom-functions).

Please [read the Slack API changelog entry](https://api.slack.com/changelog/2023-08-workflow-steps-from-apps-step-back) for more information.

:::

When a builder adds (or later edits) your step in their workflow, your app will receive a [`workflow_step_edit` event](https://api.slack.com/reference/workflows/workflow_step_edit). The `edit` callback in your `WorkflowStep` configuration will be run when this event is received.

Whether a builder is adding or editing a step, you need to send them a [step form app configuration modal](https://api.slack.com/reference/workflows/configuration-view). This modal is where step-specific settings are chosen, and it has more restrictions than typical modals—most notably, it cannot include `title​`, `submit​`, or `close`​ properties. By default, the configuration modal's `callback_id` will be the same as the step from app.

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
