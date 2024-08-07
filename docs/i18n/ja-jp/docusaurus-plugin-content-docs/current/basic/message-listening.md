---
title: メッセージ・イベントのリスニング
lang: ja-jp
slug: /concepts/message-listening
---

[アプリが受信可能な](https://api.slack.com/messaging/retrieving#permissions)メッセージをリッスンするには、`message` 型でないイベントを除外する `message()` メソッドを使用します。

`message()` は、`string` 型か `RegExp` 型の、指定パターンに一致しないメッセージを除外する `pattern` パラメーター（指定は必須ではありません）を受け付けます。

```javascript
// 特定の文字列、この場合 👋絵文字を含むメッセージと一致
app.message(':wave:', async ({ message, say }) => {
  // 新しく投稿されたメッセージだけを処理
  if (message.subtype === undefined
    || message.subtype === 'bot_message'
    || message.subtype === 'file_share'
    || message.subtype === 'thread_broadcast') {
    await say(`Hello, <@${message.user}>`);
  }
});
```

<details>
<summary>
正規表現（RegExp） パターンの使用
</summary>

文字列の代わりに 正規表現(RegExp) パターンを使用すると、より細やかなマッチングが可能です。

RegExp の一致結果はすべて `context.matches` に保持されます。

```javascript
app.message(/^(hi|hello|hey).*/, async ({ context, say }) => {
  // context.matches の内容が特定の正規表現と一致
  const greeting = context.matches[0];

  await say(`${greeting}, how are you?`);
});
```

</details>