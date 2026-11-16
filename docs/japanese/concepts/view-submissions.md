# モーダルでの送信のリスニング

`view` メソッドを使うと、ユーザーのビューとのインタラクションをリッスンすることができます。

ユーザーがモーダルからデータ送信したとき、Slack から `view_submission` のリクエストが送信されます。送信された `input` ブロックの値は `state` オブジェクトから取得できます。`state` 内には `values` というオブジェクトがあり、これは `block_id` と一意な `action_id` に紐づける形で入力値を保持しています。
モーダルでの `notify_on_close` プロパティを `true` に設定した場合、ユーザーが Close ボタンを押したときに Slack から `view_closed` リクエストが送信されます。 より詳細な情報は以下の **モーダルを閉じるときのハンドリング** を参照してください。
`view_submission` や `view_closed` リクエストをリッスンするには、組み込みの `view()` メソッドを使用できます。

`view()` メソッドでは、文字列か正規表現の `callback_id` の指定が必要です。`type` と `callback_id` を含む制約付きオブジェクトを渡すこともできます。

---

## モーダル送信でのビューの更新

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
この例と同様に、モーダルでの送信リクエストに対して、[エラーを表示する](/surfaces/modals#displaying_errors) ためのオプションもあります。

より詳細な情報は [API ドキュメント](/surfaces/modals#interactions)を参照してください。

---

## モーダルを閉じるときのハンドリング

💡 `view_closed` リクエストをリッスンするとき、`callback_id` と `type: 'view_closed'` を含むオブジェクトの指定が必要です。以下の例を参照してください。

`view_closed` に関するより詳細な情報は [API ドキュメント](/surfaces/modals#interactions)を参照してください。

```javascript
// view_closed リクエストの処理
app.view({ callback_id: 'view_b', type: 'view_closed' }, async ({ ack, body, view, client }) => {
  // view_closed リクエストの確認
  await ack();
  // close リクエストについて何らかの処理
});
```

```javascript
// モーダルでのデータ送信リクエストを処理します
app.view('view_b', async ({ ack, body, view, client, logger }) => {
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
      text: msg,
    });
  } catch (error) {
    logger.error(error);
  }
});
```
