---
title: モーダルの更新と多重表示
lang: ja-jp
slug: /concepts/updating-pushing-views
---

モーダルでは、複数のモーダルをスタックのように積み重ねて表示できます。[`views.open`](https://api.slack.com/methods/views.open) という API を呼び出すと、まず親の（最初の）モーダルが表示されます。この最初の呼び出しの後、[`views.update`](https://api.slack.com/methods/views.update) を実行することでそのビューを書き換えることもできますし、最初に述べたように [`views.push`](https://api.slack.com/methods/views.push) で新しいモーダルを積み重ねて表示することもできます。

## `views.update`

モーダルの更新には、組み込みの API クライアントを使って `views.update` を呼び出します。この API 呼び出しには、そのモーダルを開いたときに生成された `view_id` と、更新後の内容を表現する `blocks` の配列を含む新しい `view` を渡します。ユーザーが既存のモーダル内の要素とインタラクションを行なった（例：ボタンを押す、メニューから選択する）ことをトリガーにビューを更新する場合、そのリクエストの `body` に `view_id` が含まれます。

## `views.push`

モーダルのスタックに新しいモーダルを積み重ねるためには、組み込みの API クライアントを用いて `views.push` を呼び出します。この API 呼び出しには、有効な `trigger_id` と、新しく生成する [ビュー部分のペイロード](https://api.slack.com/reference/block-kit/views)を渡します。`views.push` の引数は [モーダルを開始するとき](/concepts/creating-modals)と同様です。最初のモーダルを開いた後、その上にさらに二つまで追加のモーダルをスタックに積み重ねることができます。

より詳細な情報は [API ドキュメント](/concepts/view-submissions)を参照してください。

```javascript
// action_id: button_abc のボタンを押すイベントをリッスン
// （そのボタンはモーダルの中にあるという想定）
app.action('button_abc', async ({ ack, body, client, logger }) => {
  // ボタンを押したイベントを確認
  await ack();

  try {
    if (body.type !== 'block_actions' || !body.view) {
      return;
    }
    const result = await client.views.update({
      // リクエストに含まれる view_id を渡す
      view_id: body.view.id,
      // 競合状態を防ぐために更新前の view に含まれる hash を指定
      hash: body.view.hash,
      // 更新された view の値をペイロードに含む
      view: {
        type: 'modal',
        // callback_id が view を特定するための識別子
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Updated modal'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'You updated the modal!'
            }
          },
          {
            type: 'image',
            image_url: 'https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif',
            alt_text: 'Yay! The modal was updated'
          }
        ]
      }
    });
    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});
```