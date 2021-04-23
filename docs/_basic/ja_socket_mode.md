---
title: ソケットモードの使用
lang: ja-jp
slug: socket-mode
order: 16
---

<div class="section-content">

[ソケットモード](https://api.slack.com/socket-mode) は、アプリに WebSocket での接続と、そのコネクション経由でのデータ受信を可能とします。コネクションをハンドリングするために `@slack/bolt@3.0.0` 以上では `SokcetModeReceiver` というレシーバーが提供されています。ソケットモードを使う前に、アプリの管理画面でソケットモードの機能が有効になっているコオを確認しておいてください。

`SocketModeReceiver` を使う方法は `App` インスタンスの初期化時にコンストラクターに `socketMode: true` と `appToken: YOUR_APP_TOKEN` を渡すだけです。App Level Token は、アプリ管理画面の **Basic Information** セクションから取得できます。
</div>

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.BOT_TOKEN,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
})();
```

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">ソケットモードレシーバーのカスタム初期化</h4>
</summary>

<div class="secondary-content" markdown="0">

以下のように `@slack/bolt` から `SocketModeReceiver` を import して、カスタムされたインスタンスとして定義することができます。

</div>

```javascript
const { App, SocketModeReceiver } = require('@slack/bolt');

const socketModeReceiver = new SocketModeReceiver({
  appToken: process.env.APP_TOKEN,

  // OAuth フローの実装を合わせて使う場合は、以下を有効にしてください
  // clientId: process.env.CLIENT_ID,
  // clientSecret: process.env.CLIENT_SECRET,
  // stateSecret: 'my-state-secret',
  // scopes: ['channels:read', 'chat:write', 'app_mentions:read', 'channels:manage', 'commands'],
});

const app = new App({
  receiver: socketModeReceiver,
  // OAuth を使うなら以下の token 指定は不要です
  token: process.env.BOT_TOKEN
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
})();
```

</details>
