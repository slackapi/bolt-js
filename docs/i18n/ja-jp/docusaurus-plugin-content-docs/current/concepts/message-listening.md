---
title: メッセージ・イベントのリスニング
lang: ja-jp
slug: /concepts/message-listening
---

[アプリが受信可能な](https://api.slack.com/messaging/retrieving#permissions)メッセージをリッスンするには、`message` 型でないイベントを除外する `message()` メソッドを使用します。`message()` リスナーは `event('message')` と等価の機能を提供します。


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

## 正規表現（RegExp） パターンの使用

文字列の代わりに 正規表現(RegExp) パターンを使用すると、より細やかなマッチングが可能です。

RegExp の一致結果はすべて `context.matches` に保持されます。

```javascript
app.message(/^(hi|hello|hey).*/, async ({ context, say }) => {
  // context.matches の内容が特定の正規表現と一致
  const greeting = context.matches[0];

  await say(`${greeting}, how are you?`);
});
```

## メッセージのサブタイプのフィルタリング


イベントのサブタイプをフィルタリングしたい場合、組み込みの `subtype()` ミドルウェアを使用できます。 `message_changed` や `message_replied` のような一般的なメッセージサブタイプの情報は、[メッセージイベントのドキュメント](https://api.slack.com/events/message#message_subtypes)を参照してください。

```javascript
// パッケージから subtype をインポート
const { App, subtype } = require('@slack/bolt');

// user からのメッセージの編集と一致
app.message(subtype('message_changed'), ({ event, logger }) => {
  // この if 文は TypeScript でコードを書く際に必要
  if (event.subtype === 'message_changed'
    && !event.message.subtype
    && !event.previous_message.subtype) {
    logger.info(`The user ${event.message.user} changed their message from ${event.previous_message.text} to ${event.message.text}`);
  }
});