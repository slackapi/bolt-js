---
title: モーダルでの送信のリスニング
lang: ja-jp
slug: view-submissions
order: 12
---

<div class="section-content">

`view` メソッドを使ってユーザーからのインタラクションをリッスンすることができます。

`view_submission` リクエストは、アプリが開いたモーダルでユーザーが Submit ボタンを押したときに発生します。`input` ブロックの値は `state` オブジェクトを参照することで取得できます。`state` 内には `values` というオブジェクトがあり、これは `block_id` と一意な `action_id` に紐づける形で入力値を保持しています。
モーダルでの `notify_on_close` プロパティが `true` に設定した場合、ユーザーが Close ボタンを押すと Slack は `view_closed` リクエストも送信します。 より詳細な情報は以下の **モーダルを閉じるときのハンドリング** を参照してください。
`view_submission` リクエストあるいは `view_closed` リクエストをリッスンするためには、組み込みの `view()` メソッドを使用します。

`view()` メソッドは、文字列型または `RegExp` 型の `callback_id` を必要とします。あるいは、 `type` と `callback_id` を用いた制約付きオブジェクトを必要とします。

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

より詳細な情報は <a href="https://api.slack.com/surfaces/modals/using#handling_submissions">API ドキュメント</a>を参照してください。
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

---

##### モーダルを閉じるときのハンドリング

💡 `view_closed` リクエストをリッスンするとき、`callback_id` と `type: 'view_closed'` を含んだオブジェクトを指定することが必要とします。以下の例を参照してください。

`view_closed` についてより詳細な情報は [API ドキュメント](https://api.slack.com/surfaces/modals/using#modal_cancellations)を参照してください。
```javascript
// view_closed リクエストの処理
app.view({ callback_id: 'view_b', type: 'view_closed' }, async ({ ack, body, view, client }) => {
  // view_closed リクエストの確認
  await ack();
  // close リクエストに何らかの処理
});
```