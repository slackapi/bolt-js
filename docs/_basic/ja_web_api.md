---
title: Web API の使用
lang: ja-jp
slug: web-api
order: 4
---

<div class="section-content">
[Web API メソッド](https://api.slack.com/methods)を呼び出すには、Bolt アプリに `app.client` として提供されている [`WebClient`](https://slack.dev/node-slack-sdk/web-api) を使用します (各 API に必要となるスコープの適切な設定が必要です)。クライアントが提供するメソッドを 1 つ呼び出すと、それへの Slack からの応答を含む Promise の値が返されます。

Bolt の初期化時に使用されたトークンは `context` オブジェクト内に保持されています。このトークンは、ほとんどの Web API メソッドの実行に必要となります。
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
      channel: message.channel.id,
      post_at: whenSeptemberEnds,
      text: 'Summer has come and passed'
    });
  }
  catch (error) {
    console.error(error);
  }
});
```
