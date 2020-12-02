---
title: Web API の使用
lang: ja-jp
slug: web-api
order: 4
---

<div class="section-content">
[Web API メソッド](https://api.slack.com/methods)を呼び出すには、リスナー関数の引数に `client` として提供されている [`WebClient`](https://slack.dev/node-slack-sdk/web-api) を使用します。このインスタンスが使用するトークンは、Bolt アプリの初期化時に指定されたもの <b>もしくは</b> Slack からのリクエストに対して [`authorize` 関数](#authorization)から返されたものが設定されます。組み込みの [OAuth サポート](#authenticating-oauth)は、この後者のケースをデフォルトでハンドリングします。

Bolt アプリケーションは、トップレベルに `app.client` も持っています。このインスタンスには、トークンをメソッド呼び出しのパラメーターとして都度指定します。Slack からのリクエストが authorize されないユースケースや、リスナー関数の外で Web API を呼び出したい場合は、このトップレベルの `app.client` を使用します。

トップレベルのクライアントを使ってもリスナー関数でのクライアントを使っても、[`WebClient`](https://slack.dev/node-slack-sdk/web-api) が提供するメソッドを呼び出すと、それへの Slack からのレスポンスを含む Promise の値が返されます。

[OrG 全体へのインストール機能](https://api.slack.com/enterprise/apps)の導入により、[いくつかの Web API](https://api.slack.com/enterprise/apps/changes-apis#methods) は、動作しているワークスペースを伝えるために `team_id` パラメーターを必要とします。Bolt for JavaScript は、この `team_id` を Slack から受け取ったペイロードを元に判定し、`client` インスタンスに設定します。これは、既存のアプリケーションにとっても OrG 全体へのインストールに対応する上で有用です。既存の Web API 呼び出しの処理をアップデートする必要はありません。
</div>

```javascript
// September 30, 2019 11:59:59 PM を Unix エポックタイムで表示
const whenSeptemberEnds = 1569887999;

app.message('wake me up', async ({ message, context }) => {
  try {
    // トークンを用いて chat.scheduleMessage 関数を呼び出す
    const result = await app.client.chat.scheduleMessage({
      // アプリの初期化に用いたトークンを `context` オブジェクトに保存
      token: context.botToken,
      channel: message.channel,
      post_at: whenSeptemberEnds,
      text: 'Summer has come and passed'
    });
  }
  catch (error) {
    console.error(error);
  }
});
```
