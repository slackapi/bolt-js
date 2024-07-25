---
title: ステップの設定の保存
lang: ja-jp
slug: saving-steps
order: 4
---

<div class='section-content'>

ワークフローステップの設定モーダルが開いたら、アプリはワークフロー作成者がモーダルを送信するイベントである `view_submission` イベントを待ち受けます。このイベントを受信すると `WorkflowStep` 設定オブジェクト内の `save` コールバック関数が実行されます。

`save` コールバック関数の中では、以下の引数を渡してステップの設定を保存するための `update()` 関数を利用できます。

- `inputs` は、ワークフローステップ実行時にアプリが受け取ることを期待するデータの内容を表現するオブジェクトです
- `outputs` は、ステップの実行が正常に完了したとき、同一ワークフロー内の後続のステップに提供するデータの内容を表現するオブジェクトの配列です。
- `step_name` は、デフォルトのステップ名を上書きするために使用します
- `step_image_url` は、デフォルトのステップのイメージ画像を上書きするために使用します

これら引数をどのように構成するかの詳細は、[ドキュメント](https://api.slack.com/reference/workflows/workflow_step)を参考にしてください。

</div>

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