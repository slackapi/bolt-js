---
title: Adding or editing workflow steps
lang: en
slug: adding-editing-steps
order: 3
beta: true
---

<div class='section-content'>

When a builder adds (or later edits) your step in their workflow, your app will receive a `workflow_step_edit` action. The callback assigned to the `edit` property of the `WorkflowStep` configuration object passed in during instantiation will run when this action occurs.

Whether a builder is adding or editing a step, you need to provide them with a special `workflow_step` modal — a workflow step configuration modal — where step-specific settings are chosen. Since the purpose of this modal is tied to a workflow step's configuration, it has more restrictions than typical modals—most notably, you cannot include `title​`, `submit​`, or `close`​ properties in the payload. By default, the `callback_id` used for this modal will be the same as that of the workflow step.

Within the `edit` callback, the `configure()` utility can be used to easily open your step's configuration modal by passing in an object with your view's `blocks`. To disable configuration save before certain conditions are met, pass in `submit_disabled` with a value of `true`.

To learn more about workflow step configuration modals, [read the documentation](https://api.slack.com/reference/workflows/configuration-view).

</div>

```javascript
const ws = new WorkflowStep('add_task', {
  edit: async ({ ack, step, configure }) => {
      await ack();

      const blocks = [
        { 
          'type': 'input',
          'block_id': 'task_name_input',
          'element': {
            'type': 'plain_text_input',
            'action_id': 'name',
            'placeholder': {
              'type': 'plain_text',
              'text': 'Add a task name'
            }
          },
          'label': {
            'type': 'plain_text',
            'text': 'Task name'
          }
        },
        { 
          'type': 'input',
          'block_id': 'task_description_input',
          'element': {
            'type': 'plain_text_input',
            'action_id': 'description',
            'placeholder': {
              'type': 'plain_text',
              'text': 'Add a task description'
            }
          },
          'label': {
            'type': 'plain_text',
            'text': 'Task description'
          }
        },
    ];

    await configure({ blocks });
  },
  save: async ({ ack, step, update }) => {},
  execute: async ({ step, complete, fail }) => {},
});
```