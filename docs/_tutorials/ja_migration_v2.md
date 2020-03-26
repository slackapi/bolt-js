---
title: 2.x マイグレーションガイド
order: 1
slug: migration-v2
lang: ja-jp
layout: tutorial
permalink: /ja-jp/tutorial/migration-v2
---
# 2.x マイグレーションガイド

<div class="section-content">
このガイドは Bolt 1.x を利用しているアプリを 2.x にアップグレードするための手順について説明します。
</div> 

---

## リスナー関数を `async` 関数に変更

Bolt アプリ内のリスナー関数は、全て `async` 関数に変更する必要があります。そして、そのリスナー関数内の `say()`、`respond()`、`ack()` メソッドの呼び出しも全て `await` を呼び出しの前につける必要があります。

これまで:

```javascript
app.action('some-action-id', ({action, ack, say}) => {
  ack();
  say('hello world');
})
```

これから:

```javascript
app.action('some-action-id', async ({action, ack, say}) => {
  await ack();
  await say('hello world');
})
```


## エラーハンドリング

Bolt for JavaScript 2.x では、より多くのユースケースで、必要に応じてエラーをキャッチし、グローバルエラーハンドラーにそれを送るかを制御できるよう改善されました。これまでと同様、グローバルエラーハンドラーに全て任せるよりは、可能な限り、リスナー関数の内部でエラーに対処することをおすすめします。

### リスナー関数内で `try`/`catch` 節を用いたエラーハンドリング

```javascript
app.action('some-action-id', async ({action, ack, say, logger}) => {
  try {
    await ack();
    await say('hello world');
  } catch (error) {
    // ここでエラーに対処
    logger.error(error);
  }
})
```

### グローバルエラーハンドラーによるエラーハンドリング

```javascript
app.error((error) => {
  // エラーの詳細をチェックして、メッセージ送信のリトライやアプリの停止などの対処を行う
  console.error(error);
});
```

その他のエラーに関する変更:

- リスナー関数が `ack()` メソッドを 3 秒間のうちに呼び出さなかった場合、これまでのように例外を投げるのではなくログを出力するようになりました
- もしミドルウェア実行中に複数のエラーが発生した場合、Bolt for JavaScript は `slack_bolt_multiple_listener_error` という `code` と全てのエラーで構成される配列を含む `original` というパラメーターをラップしたエラーを返します

## メッセージショートカット

[メッセージショートカット](https://api.slack.com/interactivity/shortcuts/using#message_shortcuts) (以前はメッセージアクションと呼ばれていました)は、これまで `action()` メソッドでハンドリングしていましたが `shortcut()` メソッドを使うようになりました。

これまで:

```javascript
app.action('message-action-callback', ({action, ack, context}) => {
  ack();
  // ここで処理を行う
})
```

これから:

```javascript
app.shortcut('message-action-callback', async ({shortcut, ack, context}) => {
  await ack();
  // Do stuff
})
```

## ミドルウェアに関する変更

もしカスタムのミドルウェアを書いている場合は、その関数を `async` に変更し、さらに `next()` の呼び出しを `await next()` に変更してください。もし後続の処理がある場合は、関数右を `next()` に渡す代わりに、その後続の処理を `await next()` の後に実行してください。

これまで:

```javascript
function noBotMessages({message, next }) {
  function doAfter() {
    // 後続の処理をここでやる
  }
if (!message.subtype || message.subtype !== 'bot_message') {
    next(doAfter);
  }
}
```

これから:

```javascript
async function noBotMessages({message, next }) {
  if (!message.subtype || message.subtype !== 'bot_message') {
    await next();
    // 後続の処理をここでやる
  }
}
```