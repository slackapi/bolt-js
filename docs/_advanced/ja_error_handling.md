---
title: エラーの処理
lang: ja-jp
slug: error-handling
order: 1
---

<div class="section-content">
*注: Bolt 2.x からエラーハンドリングが改善されました！この変更については [2.x マイグレーションガイド](https://slack.dev/bolt/ja-jp/tutorial/migration-v2)を参照してください。*

リスナーでエラーが発生した場合は `try`/`catch` を使って直接ハンドリングすることをおすすめします。しかし、それでもなおすり抜けてしまうエラーのパターンもあるでしょう。デフォルトでは、このようなエラーはコンソールにログ出力されます。ご自身でこれらをハンドリングするには、`app.error(fn)` メソッドによって、グローバルエラーハンドラーを定義してください。
</div>

```javascript
app.error((error) => {
  // メッセージ再送信もしくはアプリを停止するかの判断をするためにエラーの詳細を出力して確認
  console.error(error);
});
```

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">エラーハンドラーでのさらなるデータを参照する</h4>
</summary>

<div class="secondary-content" markdown="0">
グローバルエラーハンドラーでリクエストからのデータをログする必要があるでしょう。または、単に Bolt で指定した `logger` を利用したい場合があるでしょう。

バージョン 3.8.0 から初め、 `extendedErrorHandler: true` をコンストラクターに渡すとリクエストの `error` 、 `logger` 、 `context` 、 `body`を含むオブジェクトがエラーハンドラーに追加されます。

リクエストライフサイクル中に、どの時点でもエラーは生じることがあります(例： `context` での特定したプロパティを指定する前に)。また、 `body` オブジェクトに利用できるデータはイベントによって異なります。これらの理由のため、値を利用する前に `context` と `body` オブジェクトに指定するプロパティの有無を確認することをおすすめします。
</div>

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  extendedErrorHandler: true,
});

app.error(({ error, logger, context, body }) => {
  // Bolt で指定した logger を使ってエラーをログ出力させる
  logger.error(error);

  if (context.teamId) {
    // デバッグ目的で、`teamId` を使う
  }
});
```

</details>
