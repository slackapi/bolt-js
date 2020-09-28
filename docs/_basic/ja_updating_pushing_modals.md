---
title: モーダルの更新と多重表示
lang: ja-jp
slug: updating-pushing-views
order: 11
---

<div class="section-content">
モーダルでは、複数のモーダルをスタックのように積み重ねて表示できます。<a href="https://api.slack.com/methods/views.open">`views.open`</a> という API を呼び出すと、まず親の（最初の）モーダルが表示されます。この最初の呼び出しの後、<a href="https://api.slack.com/methods/views.update">`views.update`</a> を実行することでそのビューを書き換えることもできますし、最初に述べたように <a href="https://api.slack.com/methods/views.push">`views.push`</a> で新しいモーダルを積み重ねて表示することもできます。

<strong><code>views.update</code></strong><br>
モーダルの更新には、組み込みの API クライアントを使って <code>views.update</code> を呼び出します。この API 呼び出しには、そのモーダルを開いたときに生成された <code>view_id</code> と、更新後の内容を表現する <code>blocks</code> の配列を含む新しい <code>view</code> を渡します。ユーザーが既存のモーダル内の要素とインタラクションを行なった（例：ボタンを押す、メニューから選択する）ことをトリガーにビューを更新する場合、そのリクエストの <code>body</code> に <code>view_id</code> が含まれます。

<strong><code>views.push</code></strong><br>
モーダルのスタックに新しいモーダルを積み重ねるためには、組み込みの API クライアントを用いて <code>views.push</code> を呼び出します。この API 呼び出しには、有効な <code>trigger_id</code> と、新しく生成する <a href="https://api.slack.com/reference/block-kit/views">ビュー部分のペイロード</a>を渡します。`views.push` の引数は <a href="#creating-modals">モーダルを開始するとき</a>と同様です。最初のモーダルを開いた後、その上にさらに二つまで追加のモーダルをスタックに積み重ねることができます。

より詳細な情報は <a href="https://slack.dev/bolt/concepts#view_submissions">API ドキュメント</a>を参照してください。
</div>

```javascript
// action_id: button_abc のボタンを押すイベントをリッスン
// （そのボタンはモーダルの中にあるという想定）
app.action('button_abc', async ({ ack, body, client }) => {
  // ボタンを押したイベントを確認
  await ack();

  try {
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
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});
```
