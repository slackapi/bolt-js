---
title: ステップの定義
lang: ja-jp
slug: creating-steps
order: 2
---

<div class='section-content'>

ワークフローステップを作るための手段として Bolt は `WorkflowStep` というクラスを提供しています。

新しい `WorkflowStep` インスタンスの生成には、そのステップの `callback_id` と設定オブジェクトを渡します。

設定オブジェクトには `edit`、`save`、`execute` という三つのプロパティがあります。これらのそれぞれは単一のコールバック関数、またはコールバック関数の配列である必要があります。すべてのコールバック関数は、ワークフローステップのイベントに関する情報を保持しする `step` オブジェクトにアクセスすることができます。

`WorkflowStep` インスタンスを生成したら、それを `app.step()` メソッドに渡します。これによって、Bolt アプリは対象のワークフローステップのイベントをリッスンしたり、設定オブジェクトが提供するコールバック関数を使ってイベントに応答したりすることができるようになります。

</div>

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
