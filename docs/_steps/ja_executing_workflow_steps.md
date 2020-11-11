---
title: ステップの実行
lang: ja-jp
slug: executing-steps
order: 5
---

<div class="section-content">

ワークフローの利用者によって、アプリが提供するカスタムのワークフローステップが実行されるとき、アプリは[`workflow_step_execute`](https://api.slack.com/events/workflow_step_execute) というイベントを受信します。このイベントの受信時に `WorkflowStep` 設定オブジェクト内の `execute` コールバック関数が実行されます。

`save` コールバック関数で予め規定された `inputs` の情報を使って、ここでの処理は、サードパーティの API を呼び出したり、データベースに情報を保存したり、そのユーザーのホームタブを更新したり、`outputs` オブジェクトを構築することで後続のワークフローステップが利用できる情報を設定したりします。

`execute` コールバック関数内では、ステップの実行が成功であることを Slack 側に伝える `complete()` 関数、失敗であることを伝える `fail()` 関数のいずれかを呼び出す必要があります。

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

    // もし全て OK なら
    await complete({ outputs });

    // もし何か問題が起きたら
    // fail({ error: { message: "Just testing step failure!" } });
  },
});
```