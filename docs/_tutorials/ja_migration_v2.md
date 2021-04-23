---
title: 2.x マイグレーションガイド
order: 2
slug: migration-v2
lang: ja-jp
layout: tutorial
permalink: /ja-jp/tutorial/migration-v2
---
# 2.x マイグレーションガイド

<div class="section-content">
このガイドは Bolt 1.x を利用しているアプリを 2.x にアップグレードするための手順について説明します。いくつかの変更が必要とはなりますが、ほとんどのアプリの場合で、おそらく対応に必要な時間は 5 〜 15 分程度です。

*注: もしすぐにアップグレードをしない場合は、[Bolt 1.x に関するサポートスケジュール](#bolt-1x-%E3%81%AE%E3%82%B5%E3%83%9D%E3%83%BC%E3%83%88%E3%82%B9%E3%82%B1%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB)をご確認ください*
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
app.error(async (error) => {
  // エラーの詳細をチェックして、メッセージ送信のリトライやアプリの停止などの対処を行う
  console.error(error);
});
```

その他のエラーに関する変更:

- リスナー関数が `ack()` メソッドを 3 秒間のうちに呼び出さなかった場合、これまでのように例外を投げるのではなくログを出力するようになりました
- もし一つのイベントに対して複数のリスナー関数を実行中に複数のエラーが発生した場合、Bolt for JavaScript は `ErrorCode.MultipleListenerError` の値での `code` と、発生した個々のエラーの配列を含む `originals` というパラメーターをラップしたエラーを返します

## メッセージショートカット

[メッセージショートカット](https://api.slack.com/interactivity/shortcuts/using#message_shortcuts) (以前はメッセージアクションと呼ばれていました)は、これまで `action()` メソッドでハンドリングしていましたが `shortcut()` メソッドを使うようになりました。

これまで:

```javascript
app.action({ callback_id: 'message-action-callback' }, ({action, ack, context}) => {
  ack();
  // ここで処理を行う
})
```

これから:

```javascript
app.shortcut('message-action-callback', async ({shortcut, ack, context}) => {
  await ack();
  // ここで処理を行う
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

### Bolt 1.x のサポートスケジュール

`@slack/bolt@1.x` は **2020 年 6 月 30 日** より非推奨となります。それまでの期間はケースバイケースでバグ修正や新機能のバックポートを対応を継続します。`@slack/bolt@1.x` が非推奨となった後は、End of life（正式サポートの終了日）まで **クリティカルなバグ修正のみ** を実装し、クリティカルではない issue や pull request はクローズします。End of life は **2021 年 4 月 30 日** の予定です。この日からは `@slack/bolt@1.x` の開発は完全に終了となり、残っている open issue や pull request もクローズされます。

### TypeScript の最低必須バージョン

[TypeScript 利用ガイド]({{ site.url | append: site.baseurl }}/ja-jp/tutorial/using-typescript) でも説明していますが、`@slack/bolt@2.x` は TypeScirpt 3.7 以上が必須バージョンです。
