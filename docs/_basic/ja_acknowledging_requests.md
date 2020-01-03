---
title: イベントの確認
lang: ja-jp
slug: acknowledge
order: 7
---

<div class="section-content">
アクション、コマンド、およびオプションイベントは、常に `ack()` 関数を使用して確認する必要があります。これにより、Slack がイベントの受信を認識することができ、それに応じて Slack ユーザーインターフェイスが更新されます。イベントのタイプによっては、確認通知が異なることがあります。たとえば、ダイアログの送信を確認するときに、送信にエラーが含まれている場合は検証エラーを出して `ack()` を呼び出し、送信が有効な場合はパラメータなしで `ack()` を呼び出します。

この ack() による応答は 3 秒以内にしなければならないので、新しいメッセージを送信したり、データベースから情報を取得したりする直前に `ack()` を呼び出すことをお勧めします。
</div>

```javascript
// Regex でメールアドレスが有効かチェック
let isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
// 制約付きのオブジェクト を使用して ticket_submit という callback_id を持つダイアログ送信をリスニング
app.action({ callback_id: 'ticket_submit' }, ({ action, ack }) => {
  // メールアドレスが有効。ダイアログを受信
  if (isEmail.test(action.submission.email)) {
    ack();
  } else {
    // メールアドレスが無効。エラーを確認
    ack({
      errors: [{
        "name": "email_address",
        "error": "Sorry, this isn’t a valid email"
      }]
    });
  }
});
```
