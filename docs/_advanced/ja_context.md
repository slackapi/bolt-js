---
title: context の追加
lang: ja-jp
slug: context
order: 6
---

<div class="section-content">
すべてのリスナーから、情報を追加してイベントを充実させるために使用できる `context` オブジェクトにアクセスすることができます。これはたとえば、サードパーティのシステムからユーザー情報を追加したり、チェーン内の次のミドルウェアの一時的な状態を追加したりする場合に使用します。

`context` は単なるオブジェクトであるため、必要な情報をいくらでも追加、編集できます。
</div>

```javascript
async function addTimezoneContext({ payload, context, next }) {
  const user = await app.client.users.info({
    token: context.botToken,
    user: payload.user_id,
    include_locale: true
  });

  // ユーザのタイムゾーン情報を追加
  context.tz_offset = user.tz_offset;
}

app.command('request', addTimezoneContext, async ({ command, ack, context }) => {
  // コマンドリクエストの確認
  ack();
  // リクエスト時のローカル時間を取得
  const local_hour = (Date.UTC() + context.tz_offset).getHours();

  // チャンネル ID のリクエスト
  const requestChannel = 'C12345';

  const requestText = `:large_blue_circle: *New request from <@${command.user_id}>*: ${command.text}`;

  // 午前9時〜午後5時以外のリクエストの場合は明日
  if (local_hour > 17 || local_hour < 9) {
    // ローカル時間の明日午前９時までの差分を取得する関数があると仮定
    const local_tomorrow = getLocalTomorrow(context.tz_offset);

    try {
      // メッセージ送信スケジュールを調整
      const result = await app.client.chat.scheduleMessage({
        token: context.botToken,
        channel: requestChannel,
        text: requestText,
        post_at: local_tomorrow
      });
    }
    catch (error) {
      console.error(error);
    }
  } else {
    try {
      // 送信
      const result = app.client.chat.postMessage({
        token: context.botToken,
        channel: requestChannel,
        text: requestText
      });
    }
    catch (error) {
      console.error(error);
    }
  }
});
```