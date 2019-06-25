---
title: エラーの処理
lang: en
slug: error-handling
order: 1
---

<div class="section-content">
リスナーの中でエラーが発生した場合は、リスナー内で直接ハンドリングすることが望ましいでしょう。しかし、リスナーがすでに return した後でエラーが発生する場合もあります。 (`say()` または `respond()` を呼び出した場合や、必要なときに `ack()` を呼び出さなかった場合など)。このようなエラーはデフォルトではコンソールにログ出力されます。ユーザー自身がこうしたエラーを処理するには、`error(fn)` メソッドを使用してグローバルエラーハンドラーをアプリにアタッチします。

エラーをよりスマートに管理するには、`client` キーの配下で (`say()` や `respond()` の代わりに) アプリにアタッチされている [`chat.postMessage`](https://api.slack.com/methods/chat.postMessage) メソッドを使用することをお勧めします。これにより `Promise` が返されるため、そこでエラーをキャッチして処理することができます。
</div>

```javascript
app.error((error) => {
	// Check the details of the error to handle cases where you should retry sending a message or stop the app
	console.error(error);
});
```