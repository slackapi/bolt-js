---
title: モーダルの開始
lang: ja-jp
slug: /concepts/creating-modals
---

[モーダル](https://api.slack.com/block-kit/surfaces/modals)は、ユーザー情報を収集したり、動的な表示を実現するためのインターフェースです。モーダルは、有効な `trigger_id` と [ビュー部分のペイロード](https://api.slack.com/reference/block-kit/views) を組み込みの API クライアントによる [`views.open`](https://api.slack.com/methods/views.open) メソッドの呼び出しに渡すことで開始することができます。

`trigger_id` はスラッシュコマンド、ボタンの押下、メニューの選択などによって Request URL に送信されたペイロードの項目として入手することができます。

モーダルの生成についてのより詳細な情報は [API ドキュメント](https://api.slack.com/surfaces/modals/using#composing_views)を参照してください。

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