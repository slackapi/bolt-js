---
title: context の追加
lang: jp
slug: context
order: 6
---

<div class="section-content">
すべてのリスナーから、情報を追加してイベントを充実させるために使用できる `context` オブジェクトにアクセスすることができます。これはたとえば、サードパーティのシステムからユーザー情報を追加したり、チェーン内の次のミドルウェアの一時的な状態を追加したりする場合に使用します。

`context` は単なるオブジェクトであるため、必要な情報をいくらでも追加、編集できます。
</div>

```javascript
async function addTimezoneContext ({ payload, context, next }) {
  const user = await app.client.users.info({
    token: context.botToken,
    user: payload.user_id,
    include_locale: true
  });

  // Add user's timezone context
  context.tz_offset = user.tz_offset;
}

app.command('request', addTimezoneContext, async ({ command, ack, context }) => {
  // Acknowledge command request
  ack();
  // Get local hour of request
  const local_hour = (Date.UTC() + context.tz_offset).getHours();

  // Request channel ID
  const requestChannel = 'C12345';

  const requestText = `:large_blue_circle: *New request from <@${command.user_id}>*: ${command.text}`;

  // If request not inbetween 9AM and 5PM, send request tomorrow
  if (local_hour > 17 || local_hour < 9) {
    // Assume function exists to get local tomorrow 9AM from offset
    const local_tomorrow = getLocalTomorrow(context.tz_offset);

    try {
      // Schedule message
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
      // Post now
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