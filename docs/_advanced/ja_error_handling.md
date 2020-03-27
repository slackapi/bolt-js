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