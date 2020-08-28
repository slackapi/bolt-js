---
title: メッセージ・イベントのリスニング
lang: ja-jp
slug: message-listening
order: 1
---

<div class="section-content">
[アプリが受信可能な](https://api.slack.com/messaging/retrieving#permissions)メッセージをリッスンするには、`message` 型でないイベントを除外する `message()` メソッドを使用します。

`message()` は、`string` 型か `RegExp` 型の、指定パターンに一致しないメッセージを除外する `pattern` パラメーター（指定は必須ではありません）を受け付けます。
</div>

```javascript
// 特定の文字列、この場合 👋絵文字を含むメッセージと一致
app.message(':wave:', async ({ message, say }) => {
  await say(`Hello, <@${message.user}>`);
});
```

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">正規表現（RegExp） パターンの使用</h4>
</summary>

<div class="secondary-content" markdown="0">
文字列の代わりに 正規表現(RegExp) パターンを使用すると、より細やかなマッチングが可能です。

RegExp の一致結果はすべて `context.matches` に保持されます。
</div>

```javascript
app.message(/^(hi|hello|hey).*/, async ({ context, say }) => {
  // context.matches の内容が特定の正規表現と一致
  const greeting = context.matches[0];

  await say(`${greeting}, how are you?`);
});
```

</details>
