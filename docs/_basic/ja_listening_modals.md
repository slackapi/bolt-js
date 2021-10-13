---
title: モーダルでの送信のリスニング
lang: ja-jp
slug: view_submissions
order: 12
---

<div class="section-content">
<a href="https://api.slack.com/reference/block-kit/views">モーダルのペイロード</a>が入力のブロックを含む場合、その入力値を受け取るために `view_submission` のリクエストをリッスンする必要があります。`view_submission` リクエストをリッスンするためには、組み込みの `view()` メソッドを使用します。

`view()` メソッドは、文字列型または `RegExp` 型 の `callback_id` を必要とします。

`input` ブロックの値は `state` オブジェクトを参照することで取得できます。`state` 内には `values` というオブジェクトがあり、これは `block_id` と一意な `action_id` に紐づける形で入力値を保持しています。

---

##### モーダル送信でのビューの更新

`view_submission` リクエストに対してモーダルを更新するには、リクエストの確認の中で `update` という `response_action` と新しく作成した `view` を指定します。

```javascript
// モーダル送信でのビューの更新
app.view('modal-callback-id', async ({ ack, body }) => {
  await ack({
    response_action: 'update',
    view: buildNewModalView(body),
  });
});
```
この例と同様に、モーダルでの送信リクエストに対して、[エラーを表示する](https://api.slack.com/surfaces/modals/using#displaying_errors) ためのオプションもあります。

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
