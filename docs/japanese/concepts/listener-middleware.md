---
title: リスナーミドルウェア
lang: ja-jp
slug: /ja-jp/bolt-js/concepts/listener-middleware
---

リスナーミドルウェアは、多くのリスナー関数を対象（つまり、複数のリスナー関数を対象としますが、全てのリスナーに実行するわけではないものです）としたロジックの適用に使用でき、リスナーを追加する組み込みメソッドの引数リスト内で、リスナー関数より先に引数として追加されます。ここでは任意の数のリスナーミドルウェアを追加することができます。

組み込みリスナーミドルウェアはいくつか用意されており、例えば、メッセージのサブタイプをフィルタリングする `subtype()` や、メッセージのはじまりでボットに直接 @ メンションしないメッセージを除外する `directMention()` のように使用することができます。

もちろん、よりカスタマイズされた機能を追加するために独自のミドルウェアを実装することもできます。カスタムミドルウェアとして動作する関数の実装は `await next()` を呼び出して制御を次のミドルウェアに渡すか、`throw` を呼び出して以前に実行されたミドルウェアチェーンにエラーを投げる必要があります。

例として、リスナーが人（ボットではないユーザー）からのメッセージのみを扱うケースを考えてみましょう。このためには、全てのボットメッセージを除外するリスナーミドルウェアを実装します。

:::info

Bolt 2.x からミドルウェアが `async` 関数をサポートしました！この変更については [2.x マイグレーションガイド](/bolt-js/migration/migration-v2)を参照してください。

:::

```javascript
// ボットからのメッセージをフィルタリングするリスナーミドルウェア
async function noBotMessages({ message, next }) {
  if (!message.bot_id) {
    await next();
  }
}

// ボットではなく人間からのメッセージのみを受信するリスナー
app.message(noBotMessages, async ({ message, logger }) => {
  // 新規で投稿されたメッセージのみを処理
  if (
    message.subtype === undefined ||
    message.subtype === 'file_share' ||
    message.subtype === 'thread_broadcast'
  ) {
    logger.info(`(MSG) User: ${message.user} Message: ${message.text}`);
  }
});
```
