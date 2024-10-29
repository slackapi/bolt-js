---
title: ワークフローステップの概要
lang: ja-jp
slug: /legacy/steps-from-apps
---

（アプリによる）ワークフローステップ（Workflow Steps from Apps) は、[ワークフロービルダー](https://api.slack.com/workflows)におけるワークフローに組み込み可能なカスタムのワークフローステップを任意の Slack アプリが提供することを可能とします。

ワークフローステップは、三つの異なるユーザーイベントから構成されます:

- ワークフロー作成者がワークフローにカスタムステップを追加・または編集する
- ワークフロー作成者がステップの設定を保存・更新する
- ワークフローの利用者がそのワークフローステップを実行する

ワークフローステップを機能させるためには、これら三つのイベント全てを適切にハンドリングする必要があります。

ワークフローステップのさらなる詳細については [API ドキュメント](https://api.slack.com/workflows/steps)を参考にしてください。

---

## ステップの定義

ワークフローステップを作るための手段として Bolt は `WorkflowStep` というクラスを提供しています。

新しい `WorkflowStep` インスタンスの生成には、そのステップの `callback_id` と設定オブジェクトを渡します。

設定オブジェクトには `edit`、`save`、`execute` という三つのプロパティがあります。これらのそれぞれは単一のコールバック関数、またはコールバック関数の配列である必要があります。すべてのコールバック関数は、ワークフローステップのイベントに関する情報を保持しする `step` オブジェクトにアクセスすることができます。

`WorkflowStep` インスタンスを生成したら、それを `app.step()` メソッドに渡します。これによって、Bolt アプリは対象のワークフローステップのイベントをリッスンしたり、設定オブジェクトが提供するコールバック関数を使ってイベントに応答したりすることができるようになります。


```javascript
const { App, WorkflowStep } = require('@slack/bolt');

// いつも通り Bolt アプリを初期化
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

// WorkflowStep インスタンスを生成
const ws = new WorkflowStep('add_task', {
  edit: async ({ ack, step, configure }) => {},
  save: async ({ ack, step, update }) => {},
  execute: async ({ step, complete, fail }) => {},
});

app.step(ws);
```

---

##  ステップの追加・編集

ワークフローの作成者が、アプリが提供するステップをワークフローに追加（またはその設定を変更）するタイミングで、アプリは [`workflow_step_edit`](https://api.slack.com/reference/workflows/workflow_step_edit) というイベントを受信します。このイベントの受信時に `WorkflowStep` 設定オブジェクト内の `edit` コールバック関数が実行されます。

このとき、ワークフロー作成・変更のどちらの場合でも、アプリは[ワークフローステップ設定のためのモーダル](https://api.slack.com/reference/workflows/configuration-view)を応答する必要があります。このモーダルは、ワークフローステップに固有の設定である必要があり、通常のモーダルにはない制約があります。最もわかりやすいものとしては、`title​`、`submit​`、`close` プロパティを設定することができません。また、デフォルトの設定では、この設定モーダルの `callback_id` はワークフローステップのものと同じものが使用されます。

`edit` コールバック関数の中では モーダルの view のうち `blocks` だけを渡すだけで簡単にステップ設定モーダルをオープンすることができる `configure()` というユーティリティ関数が利用できます。これは、必要な入力内容が揃うまで設定の保存を無効にする `submit_disabled` というオプションを `true` に設定します。

設定モーダルを開く処理に関するさらなる詳細は、[ドキュメント](https://api.slack.com/workflows/steps#handle_config_view)を参考にしてください。

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

---

##  ステップの設定の保存

ワークフローステップの設定モーダルが開いたら、アプリはワークフロー作成者がモーダルを送信するイベントである `view_submission` イベントを待ち受けます。このイベントを受信すると `WorkflowStep` 設定オブジェクト内の `save` コールバック関数が実行されます。

`save` コールバック関数の中では、以下の引数を渡してステップの設定を保存するための `update()` 関数を利用できます。

- `inputs` は、ワークフローステップ実行時にアプリが受け取ることを期待するデータの内容を表現するオブジェクトです
- `outputs` は、ステップの実行が正常に完了したとき、同一ワークフロー内の後続のステップに提供するデータの内容を表現するオブジェクトの配列です。
- `step_name` は、デフォルトのステップ名を上書きするために使用します
- `step_image_url` は、デフォルトのステップのイメージ画像を上書きするために使用します

これら引数をどのように構成するかの詳細は、[ドキュメント](https://api.slack.com/reference/workflows/workflow_step)を参考にしてください。

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


---

## ステップの実行

ワークフローの利用者によって、アプリが提供するカスタムのワークフローステップが実行されるとき、アプリは[`workflow_step_execute`](https://api.slack.com/events/workflow_step_execute) というイベントを受信します。このイベントの受信時に `WorkflowStep` 設定オブジェクト内の `execute` コールバック関数が実行されます。

`save` コールバック関数で予め規定された `inputs` の情報を使って、ここでの処理は、サードパーティの API を呼び出したり、データベースに情報を保存したり、そのユーザーのホームタブを更新したり、`outputs` オブジェクトを構築することで後続のワークフローステップが利用できる情報を設定したりします。

`execute` コールバック関数内では、ステップの実行が成功であることを Slack 側に伝える `complete()` 関数、失敗であることを伝える `fail()` 関数のいずれかを呼び出す必要があります。

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
    // 注意: processBeforeResponse: true を指定している場合
    // ここでは await complete() はおすすめしません。呼び出す API の応答が遅いためです。
    // これにより、3 秒以内に Slack のイベント API に応答することができなくなる場合があります。
    // 代わりに以下のようにすることができます:
    // complete({ outputs }).then(() => { console.log('workflow step execution complete registered'); });

    // もし何か問題が起きたら
    // fail({ error: { message: "Just testing step failure!" } }).then(() => { console.log('workflow step execution failure registered'); });
  },
});
```