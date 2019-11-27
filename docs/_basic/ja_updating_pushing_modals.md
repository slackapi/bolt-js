---
title: モーダルビューの更新と多重表示
lang: ja-jp
slug: updating-pushing-views
order: 10
---

<div class="section-content">
モーダルビューの表示は、複数のビューをスタックとして保持する場合があります。<a href="https://api.slack.com/methods/views.open">`views.open`</a> という API を呼び出すと、まずルートのモーダルビューが生成されます。その最初の呼び出しの後で、<a href="https://api.slack.com/methods/views.update">`views.update`</a> によって動的にそのビューを書き換えたり、<a href="https://api.slack.com/methods/views.push">`views.push`</a> で新しいビューをその上に積み重ねて表示したりといったことができます。

<strong><code>views.update</code></strong><br>
モーダルビューを更新するには組み込みの API クライアントを使って <code>views.update</code> を呼び出します。この API 呼び出しにはそのビューをオープンしたときに生成された <code>view_id</code> と、書き換えられた <code>blocks</code> の配列を渡します。ユーザーが既存のビューの中にある要素とインタラクションを行なったことをきっかけにビューを更新する場合は、そのリクエストの <code>body</code> に <code>view_id</code> が含まれています。

<strong><code>views.push</code></strong><br>
ビューのスタックに新しいビューを積み重ねるには、組み込みの API クライアントを使って <code>views.push</code> を呼び出します。この API 呼び出しには、適切な <code>trigger_id</code> と新しく生成する <a href="https://api.slack.com/reference/block-kit/views">ビュー部分のペイロード</a>を渡します。`views.push` の引数は <a href="#creating-modals">ビューをオープンするとき</a>と同様です。最初のモーダルビューをオープンした後、その上にさらに二つまで追加のビューをスタックに積み重ねることができます。

より詳細な情報は <a href="https://slack.dev/bolt/concepts#view_submissions">API ドキュメント</a>を参照してください。
</div>

```javascript
// action_id: button_abc のボタンを押すイベントをリッスン
// （そのボタンはモーダルビューの中にあるという想定）
app.action('button_abc', ({ ack, body, context }) => {
  // ボタンを押したイベントを確認
  ack();

  try {
    const result = app.client.views.update({
      token: context.botToken,
      // リクエストに含まれる view_id を渡す
      view_id: body.view.id,
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
