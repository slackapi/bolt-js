---
title: モーダルでの送信のリスニング
lang: ja-jp
slug: view_submissions
order: 12
---

<div class="section-content">
<a href="https://api.slack.com/reference/block-kit/views">モーダルのペイロード</a>が入力のブロックを含む場合、その入力値を受け取るために <code>view_submission</code> のリクエストをリッスンする必要があります。<code>view_submission</code> イベントをリッスンするためには、組み込みの <code>view()</code> メソッドを使用します。

<code>view()</code> メソッドは、文字列型または <code>RegeExp</code>型 の <code>callback_id</code> を必要とします。

<code>input</code> ブロックの値は <code>state</code> オブジェクトを参照することで取得できます。<code>state</code> 内には <code>values</code> というオブジェクトがあり、これは <code>block_id</code> と一意な <code>action_id</code> に紐づける形で入力値を保持しています。

より詳細な情報は <a href="https://api.slack.com/surfaces/modals/using#interactions">API ドキュメント</a>を参照してください。
</div>

```javascript
// モーダルでのデータ送信リクエストを処理します
app.view('view_b', async ({ ack, body, view, client }) => {
  // モーダルでのデータ送信リクエストを確認
  await ack();

  // 入力値を使ってやりたいことをここで実装 - ここでは DB に保存して送信内容の確認を送っている

  // block_id: block_1 という input ブロック内で action_id: input_a の場合の入力
  const val = view['state']['values']['block_1']['input_a'];
  const user = body['user']['id'];

  // ユーザーに対して送信するメッセージ
  let msg = '';
  // DB に保存
  const results = await db.set(user.input, val);

  if (results) {
    // DB への保存が成功
    msg = 'Your submission was successful';
  } else {
    msg = 'There was an error with your submission';
  }

  // ユーザーにメッセージを送信
  try {
    await client.chat.postMessage({
      channel: user,
      text: msg
    });
  }
  catch (error) {
    console.error(error);
  }

});
```
