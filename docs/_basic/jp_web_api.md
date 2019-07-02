---
title: Web API の使用
lang: jp
slug: web-api
order: 4
---

<div class="section-content">
[Web API メソッド](https://api.slack.com/methods)を呼び出すには、Bolt アプリに提供されている [`WebClient`](https://slack.dev/node-slack-sdk/web-api) を `app.client` として使用します (この場合、適切なアプリのスコープを設定が必要です)。クライアントのメソッドの 1 つを呼び出すと、Slack からの応答を含む Promise が返されます。

Bolt の初期化に使用されるトークンは `context` オブジェクト内にあり、ほとんどの Web API メソッドで必須です。
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
