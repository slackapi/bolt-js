---
title: カスタム HTTP ルートの追加
lang: ja-jp
slug: /concepts/custom-routes
---

`v3.7.0` から `App` を初期化する際に `customRoutes` というルートの配列を渡すことでカスタムの HTTP ルートを簡単に追加できるようになりました。

各 `CustomRoute` オブジェクトには `path` 、 `method`、 `handler` という三つのプロパティが含まれていなければなりません。 HTTP メソッドに相当する `method` は文字列または文字列の配列です。

`v3.13.0` からデフォルトの組み込みレシーバーである `HTTPReceiver` と `SocketModeReceiver` が、[Express.js](https://expressjs.com/en/guide/routing.html#route-parameters) が提供するものと同様な動的なルートパラメーターをサポートするようになりました。これによって URL 内に含まれる値を `req.params` の値として利用できるようになりました。

カスタムの HTTP ルートがローカル環境でどのポートからアクセスできるかを指定するために `App` コンストラクターに `installerOptions.port` というプロパティを渡すことができます。指定しない場合は、デフォルトの `3000` ポートとなります。

```javascript
const { App } = require('@slack/bolt');

// デフォルトの HTTPReceiver を使って Bolt アプリを初期化します
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  customRoutes: [
    {
      path: '/health-check',
      method: ['GET'],
      handler: (req, res) => {
        res.writeHead(200);
        res.end(`Things are going just fine at ${req.headers.host}!`);
      },
    },
    {
      path: '/music/:genre',
      method: ['GET'],
      handler: (req, res) => {
        res.writeHead(200);
        res.end(`Oh? ${req.params.genre}? That slaps!`);
      },
    },
  ],
  installerOptions: {
    port: 3001,
  },
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
})();
```

<details>
<summary>
カスタム ExpressReceiver ルート
</summary>

Bolt の組み込みの `ExpressReceiver` を使っているなら、カスタムの HTTP ルートを追加するのはとても簡単です。`v2.1.0` から `ExpressReceiver` には `router` というプロパティが追加されています。これは、さらにルートを追加できるように `App` 内部で保持している Express の [Router](http://expressjs.com/en/4x/api.html#router) を public にしたものです。

```javascript
const { App, ExpressReceiver } = require('@slack/bolt');

// Bolt の Receiver を明に生成
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

// App をこのレシーバーを指定して生成
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
});

// Slack とのやりとりは App のメソッドで定義
app.event('message', async ({ event, client }) => {
  // Do some slack-specific stuff here
  await client.chat.postMessage(...);
});

receiver.router.use((req, res, next) => {
  console.log(`Request time: ${Date.now()}`);
  next();
});

// それ以外の Web リクエストの処理は receiver.router のメソッドで定義
receiver.router.post('/secret-page', (req, res) => {
  // ここでは Express のリクエストやレスポンスをそのまま扱う
  res.send('yay!');
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
})();
```
</details>