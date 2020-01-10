---
title: メッセージの送信
lang: ja-jp
slug: message-sending
order: 2
---

<div class="section-content">
リスナー関数内では、関連付けられている会話 (たとえば、リスナーをトリガーしたイベントやアクションが発生した会話) が存在するときにはいつでも `say()` を使用できます。 `say()` はパラメーターに文字列を入れて単純なテキストベースのメッセージを送信するか、もしくは、JSON を使ってより複雑なメッセージを送信します。渡されたメッセージペイロードは、関連付けられている会話に送信されます。

リスナーの外部にメッセージを送信する場合、またはより高度な操作 (特定のエラーの処理など) を実行する場合は、[Bolt インスタンスにアタッチされたクライアントを使用](#web-api)して `chat.postMessage` を呼び出します。
</div>

```javascript
// "knock knock" を含むメッセージをリスニングし、 "who's there?" というメッセージをイタリック体で送信
app.message('knock knock', ({ message, say }) => {
  say(`_Who's there?_`);
});
```

<details class="secondary-wrapper">
<summary markdown="0">
<h4 class="secondary-header">ブロックを使用したメッセージの送信</h4>
</summary>

<div class="secondary-content" markdown="0">
`say()` はより複雑なメッセージペイロードを受け入れて、メッセージに機能と構造を容易に追加できるようにします。

リッチなメッセージレイアウトをアプリに追加する方法については、[API サイトのガイド](https://api.slack.com/messaging/composing/layouts)を参照し、[Block Kit ビルダー](https://api.slack.com/tools/block-kit-builder?template=1)の一般的なアプリフローのテンプレートを確認してください。
</div>

```javascript
// 誰かが 📅 絵文字でリアクションした時に、日付ピッカー block を送信
app.event('reaction_added', async ({ event, say }) => {
  if (event.reaction === 'calendar') {
    await say({
      blocks: [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Pick a date for me to remind you"
        },
        "accessory": {
          "type": "datepicker",
          "action_id": "datepicker_remind",
          "initial_date": "2019-04-28",
          "placeholder": {
            "type": "plain_text",
            "text": "Select a date"
          }
        }
      }]
    });
  }
});
```
</details>
