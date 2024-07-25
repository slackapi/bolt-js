---
title: ステップの追加・編集
lang: ja-jp
slug: adding-editing-steps
order: 3
---

<div class='section-content'>

ワークフローの作成者が、アプリが提供するステップをワークフローに追加（またはその設定を変更）するタイミングで、アプリは [`workflow_step_edit`](https://api.slack.com/reference/workflows/workflow_step_edit) というイベントを受信します。このイベントの受信時に `WorkflowStep` 設定オブジェクト内の `edit` コールバック関数が実行されます。

このとき、ワークフロー作成・変更のどちらの場合でも、アプリは[ワークフローステップ設定のためのモーダル](https://api.slack.com/reference/workflows/configuration-view)を応答する必要があります。このモーダルは、ワークフローステップに固有の設定である必要があり、通常のモーダルにはない制約があります。最もわかりやすいものとしては、`title​`、`submit​`、`close` プロパティを設定することができません。また、デフォルトの設定では、この設定モーダルの `callback_id` はワークフローステップのものと同じものが使用されます。

`edit` コールバック関数の中では モーダルの view のうち `blocks` だけを渡すだけで簡単にステップ設定モーダルをオープンすることができる `configure()` というユーティリティ関数が利用できます。これは、必要な入力内容が揃うまで設定の保存を無効にする `submit_disabled` というオプションを `true` に設定します。

設定モーダルを開く処理に関するさらなる詳細は、[ドキュメント](https://api.slack.com/workflows/steps#handle_config_view)を参考にしてください。

</div>

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
