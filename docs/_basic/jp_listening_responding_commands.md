---
title: コマンドのリスニングと応答
lang: jp
slug: commands
order: 8
---

<div class="section-content">
着信するスラッシュコマンドイベントをリスニングするには、アプリで `command()` メソッドを使用します。メソッドは文字列型の `commandName` を必要とします。

アプリがイベントを受け取ったことを Slack に通知するには、コマンドを `ack()` で確認する必要があります。

スラッシュコマンドに応答する方法は 2 つあります。1 つ目の方法では、文字列または JSON ペイロードを受け入れる `say()` を使用します。2 つ目の方法では、 `response_url` のユーティリティである `response()` を使用します。これらについては、「[アクションへの応答](#action-respond)」セクションで詳しく説明しています。
</div>

```javascript
// この echo コマンドは 単純にコマンドをエコー（こだま）
app.command('/echo', async ({ command, ack, say }) => {
  // コマンドリクエストを確認
  ack();
  
  say(`${command.text}`);
});
```
