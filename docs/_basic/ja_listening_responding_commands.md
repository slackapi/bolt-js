---
title: コマンドのリスニングと応答
lang: ja-jp
slug: commands
order: 9
---

<div class="section-content">
スラッシュコマンドが実行されたイベントをリッスンするには、アプリで `command()` メソッドを使用します。メソッドの使用には文字列型の `commandName` の指定が必要です。

アプリがスラッシュコマンドのイベントを受け取ったことを `ack()` の実行によって Slack に通知する必要があります。

スラッシュコマンドへの応答には 2 つのやり方があります。1 つ目の方法は、文字列または JSON ペイロードを受け取る `say()` で、2 つ目は `response_url` を簡単に利用するためのユーティリティである `respond()` です。これらについては、「[アクションへの応答](#action-respond)」セクションで詳しく説明しています。

Slack アプリの管理画面でスラッシュコマンドを設定するとき、そのスラッシュコマンドの Request URL に（`https://{ドメイン}` に続いて） `/slack/events` を指定するようにしてください。
</div>

```javascript
// この echo コマンドは ただ、その引数を（やまびこのように）おうむ返しする
app.command('/echo', async ({ command, ack, say }) => {
  // コマンドリクエストを確認
  await ack();

  await say(`${command.text}`);
});
```
