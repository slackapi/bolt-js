---
title: エラーの処理
lang: ja-jp
slug: error-handling
order: 1
---

<div class="section-content">
*注: Bolt 2.x からエラーハンドリングが改善されました！この変更については [2.x マイグレーションガイド](https://slack.dev/bolt/ja-jp/tutorial/migration-v2)を参照してください。*

リスナーでエラーが発生した場合は `try`/`catch` を使って直接ハンドリングすることをおすすめします。しかし、それでもなおすり抜けてしまうエラーのパターンもあるでしょう。デフォルトでは、このようなエラーはコンソールにログ出力されます。ご自身でこれらをハンドリングするには、`app.error(fn)` メソッドによって、グローバルエラーハンドラーを定義してください。
</div>

また、様々なエラーパターンにより特化したエラーハンドラーを `HTTPReceiver` に直接設定することができます。

- `dispatchErrorHandler`: 想定しないパスにリクエストが来たときに実行されます
- `processEventErrorHandler`: リクエストを処理するとき（例：ミドルウェアや認可プロセス）に発生した例外に対して実行されます
- `unhandledRequestHandler`: Slack からのリクエストが確認（`ack()`）されなかったときに実行されます
- `unhandledRequestTimeoutMillis`: リクエストが受信されてから `unhandledRequestHandler` が実行されるまでの待機時間（ミリ秒単位）。 デフォルトは `3001` です。 

*注*: あなたのアプリ内に定義されたカスタムのエラーハンドラーは、エラーとなった Slack からのリクストに応答するために `response.writeHead()` を呼び出して応答の HTTP ステータスコードを設定し、かつ `response.end()` を呼び出して Slack へのレスポンスを送信する必要があります。詳細は以下の例を参考にしてください。
</div>

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  receiver: new HTTPReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    // より詳細で特化したエラーハンドラー
    dispatchErrorHandler: ({ error, logger, response }) => {
      logger.error(`dispatch error: ${error}`);
      response.writeHead(404);
      response.write("Something is wrong!");
      response.end();
    },
    processEventErrorHandler: ({ error, logger, response }) => {
      logger.error(`processEvent error: ${error}`);
      // とにかく ack する場合の方法！
      response.writeHead(200);
      response.end();
      return true;
    },
    unhandledRequestHandler: async ({ logger, response }) => {
      logger.info('Acknowledging this incoming request because 2 seconds already passed...');
      // とにかく ack する場合の方法！
      response.writeHead(200);
      response.end();
    },
    unhandledRequestTimeoutMillis: 2000, // デフォルト値は 3001
  }),
});

// より一般的でグローバルなエラーハンドラー
app.error((error) => {
  // メッセージ再送信もしくはアプリを停止するかの判断をするためにエラーの詳細を出力して確認
  console.error(error);
});
```

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">エラーハンドラーでのさらなるデータの参照</h4>
</summary>

<div class="secondary-content" markdown="0">
グローバルエラーハンドラーの中で、リクエストからのデータをログ出力したい場合もあるでしょう。あるいは単に Bolt に設定した `logger` を利用したい場合もあるでしょう。

バージョン 3.8.0 からは、コンストラクターに  `extendedErrorHandler: true` を渡すと、エラーハンドラーはリクエストの `error` 、 `logger` 、 `context` 、 `body` を含むオブジェクトを受け取ります。

`context` や `body` オブジェクト内にアクセスしたいプロパティが存在するかどうかをチェックすることをおすすめします。なぜなら `body` オブジェクト内に存在するデータはイベント毎に異なりますし、エラーはリクエストのライフサイクルの中のどんなタイミング（例えば `context` のプロパティが設定される前）でも発生しうるからです。
</div>

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  extendedErrorHandler: true,
});

app.error(({ error, logger, context, body }) => {
  // Bolt で指定した logger を使ってエラー内容をログ出力
  logger.error(error);

  if (context.teamId) {
    // デバッグのために teamId を使ってなんらかの処理
  }
});
```

</details>
