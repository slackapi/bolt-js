---
title: レシーバーのカスタマイズ
lang: ja-jp
slug: receiver
order: 8
---

<div class="section-content">
レシーバーは、Slack からのイベントを受け付けてパースした後、それを Bolt アプリに伝える責務を担っています。Bolt アプリは、`context` 情報やリスナーへのイベントの引き渡しを行います。レシーバーの実装は `Receiver` インターフェイスに準拠している必要があります。

| メソッド      | パラメーター                     | 戻り値の型   |
|--------------|----------------------------------|-------------|
| `init()`     | `app: App`                       | `unknown`   |
| `start()`    | None                             | `Promise`   |
| `stop()`     | None                             | `Promise`   |

`init()` メソッドは Bolt for JavaScript アプリが生成されたときに呼び出されます。このメソッドはレシーバーに `App` インスタンスへの参照を与えます。レシーバーはこれを保持して、イベント受信時に呼び出します。

* `await app.processEvent(event)` は Slack から送信されてくるイベントを受け取るたびに呼び出されます。ハンドリングされなかったエラーが発生した場合はそれを throw します。

カスタムのレシーバーを使用する場合は、それを `App` のコンストラクターに渡します。ここで紹介しているコード例は、基本的なカスタムレシーバーの実装例です。

レシーバーについてより深く知りたい場合は、[組み込み `ExpressReceiver` のソースコード](https://github.com/slackapi/bolt-js/blob/master/src/ExpressReceiver.ts)を参照してください。
</div>

```javascript
import { EventEmitter } from 'events';
import { createServer } from 'http';
import express from 'express';

// EventEmitter は on() 関数を操作
// https://nodejs.org/api/events.html#events_emitter_on_eventname_listener
class simpleReceiver extends EventEmitter {
  constructor(signingSecret, endpoints) {
    super();
    this.app = express();
    this.server = createServer(this.app);

    for (const endpoint of endpoints) {
      this.app.post(endpoint, this.requestHandler.bind(this));
    }
  }
  
  init(app) {
    this.bolt = app;
  }

  start(port) {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(port, () => {
          resolve(this.server);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      this.server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      })
    })
  }

  async requestHandler(req, res) {
    let ackCalled = false;
    // 着信リクエストをパースするparseBody 関数があると仮定
    const parsedReq = parseBody(req);
    const event = {
      body: parsedReq.body,
      // レシーバーが確認作業に重要
      ack: (response) => {
        if (ackCalled) {
          return;
        }
        
        if (response instanceof Error) {
          res.status(500).send();
        } else if (!response) {
          res.send('')
        } else {
          res.send(response);
        }
        
        ackCalled = true;
      }
    };
    await this.bolt.processEvent(event);
  }
}
```
