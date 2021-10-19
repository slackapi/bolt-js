---
title: リクエストの確認
lang: ja-jp
slug: acknowledge
order: 7
---

<div class="section-content">
アクション（action）、コマンド（command）、およびオプション（options）リクエストは、**必ず** `ack()` 関数を用いて確認する必要があります。これにより Slack 側にリクエストが正常に受信されたことを知らせることができ、それに応じて Slack のユーザーインターフェイスが更新されます。リクエストのタイプによっては、確認の通知方法が異なる場合があります。たとえば、モーダルの送信を確認するとき、送信内容にエラーがあればバリデーションエラーとともに `ack()` を呼び出しますが、送信内容が問題なければ、そのようなパラメータなしで `ack()` を呼び出します。

この `ack()` による応答は 3 秒以内に行う必要があります。新しいメッセージの送信や、データベースからの情報の取得などを行う前に、リクエストを受けてすぐに `ack()` を呼び出して応答を返してしまうことをおすすめします。
</div>

```javascript
// Regex でメールアドレスが有効かチェック
let isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
// 制約付きのオブジェクト を使用して ticket_submit という callback_id を持つモーダル送信をリッスン
app.view('ticket_submit', async ({ ack, view }) => {
  // block_id が `email_address` の input ブロックからメールアドレスを取得
  const email = view.state.values['email_address']['input_a'].value;

  // メールアドレスが有効。モーダルを受信
  if (isEmail.test(email)) {
    await ack();
  } else {
    // メールアドレスが無効。エラーを確認
    await ack({
      "response_action": "errors",
      errors: {
        "email_address": "Sorry, this isn’t a valid email"
      }
    });
  }
});
```
