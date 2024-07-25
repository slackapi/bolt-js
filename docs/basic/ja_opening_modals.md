---
title: モーダルの開始
lang: ja-jp
slug: creating-modals
order: 10
---

<div class="section-content">

<a href="https://api.slack.com/block-kit/surfaces/modals">モーダル</a>は、ユーザー情報を収集したり、動的な表示を実現するためのインターフェースです。モーダルは、有効な <code>trigger_id</code> と <a href="https://api.slack.com/reference/block-kit/views">ビュー部分のペイロード</a> を組み込みの API クライアントによる <a href="https://api.slack.com/methods/views.open"><code>views.open</code></a> メソッドの呼び出しに渡すことで開始することができます。

<code>trigger_id</code> はスラッシュコマンド、ボタンの押下、メニューの選択などによって Request URL に送信されたペイロードの項目として入手することができます。

モーダルの生成についてのより詳細な情報は <a href="https://api.slack.com/surfaces/modals/using#composing_views">API ドキュメント</a>を参照してください。
</div>

```javascript
// コマンド起動をリッスン
app.command('/ticket', async ({ ack, body, client, logger }) => {
  // コマンドのリクエストを確認
  await ack();

  try {
    const result = await client.views.open({
      // 適切な trigger_id を受け取ってから 3 秒以内に渡す
      trigger_id: body.trigger_id,
      // view の値をペイロードに含む
      view: {
        type: 'modal',
        // callback_id が view を特定するための識別子
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Modal title'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Welcome to a modal with _blocks_'
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Click me!'
              },
              action_id: 'button_abc'
            }
          },
          {
            type: 'input',
            block_id: 'input_c',
            label: {
              type: 'plain_text',
              text: 'What are your hopes and dreams?'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'dreamy_input',
              multiline: true
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
    });
    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});
```
