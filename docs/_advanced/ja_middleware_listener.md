---
title: リスナーミドルウェア
lang: ja-jp
slug: listener-middleware
order: 5
---

<div class="section-content">
リスナーミドルウェアは、多くのリスナー関数を対象（つまり、複数のリスナー関数を対象としますが、全てのリスナーに実行するわけではないものです）としたロジックの適用に使用でき、リスナーを追加する組み込みメソッドの引数リスト内で、リスナー関数より先に引数として追加されます。ここでは任意の数のリスナーミドルウェアを追加することができます。

組み込みリスナーミドルウェアはいくつか用意されており、例えば、メッセージのサブタイプをフィルタリングする `subtype()` や、ボットに直接 @ メンションしないメッセージを除外する `directMention()` のように使用することができます。

もちろん、よりカスタマイズされた機能を追加するために独自のミドルウェアを実装することもできます。カスタムミドルウェアとして動作する関数の実装は `await next()` を呼び出して制御を次のミドルウェアに渡すか、`throw` を呼び出して以前に実行されたミドルウェアチェーンにエラーを投げる必要があります。

例として、リスナーが人（ボットではないユーザー）からのメッセージのみを扱うケースを考えてみましょう。このためには、全てのボットメッセージを除外するリスナーミドルウェアを実装します。

*注: Bolt 2.x からミドルウェアが `async` 関数をサポートしました！この変更については [2.x マイグレーションガイド](https://slack.dev/bolt/ja-jp/tutorial/migration-v2)を参照してください。*
</div>

```javascript
// 'bot_message' サブタイプを持つメッセージをフィルタリングするリスナーミドルウェア
async function noBotMessages({ message, next }) {
  if (!message.subtype || message.subtype !== 'bot_message') {
    await next();
  }
}

// ボットではなく人間からのメッセージのみを受信するリスナー
app.message(noBotMessages, async ({ message }) => console.log(
  `(MSG) User: ${message.user}
   Message: ${message.text}`
));
```
