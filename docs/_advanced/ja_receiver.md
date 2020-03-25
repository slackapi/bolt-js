---
title: レシーバーのカスタマイズ
lang: ja-jp
slug: receiver
order: 8
---

<div class="section-content">
レシーバーは、Slack から送信されたイベントを処理およびパースして発行するので、Bolt アプリがそのイベントにコンテキストを追加し、アプリのリスナーに渡すことができます。レシーバーは、レシーバーのインターフェイスに準拠している必要があります。

| メソッド      | パラメーター                     | 戻り値の型   |
|--------------|----------------------------------|-------------|
| `init()`     | `app: App`                       | `unknown`   |
| `start()`    | None                             | `Promise`   |
| `stop()`     | None                             | `Promise`   |

Bolt アプリでは `init()` が 2 回呼び出されます。このメソッドはレシーバーに `App` の参照を付与するため、これにより以下の呼び出しが可能になります。
* `await app.processEvent(event)` は Slack から送信されてくるイベントを受け取るたびに呼び出されます。ハンドリングされなかったエラーが発生した場合はそれを throw します。

Bolt アプリを初期化するときにカスタムレシーバーをコンストラクタに渡すことで、そのカスタムレシーバーを使用できます。ここで紹介するのは、基本的なカスタムレシーバーです。

レシーバーについて詳しくは、[組み込み `ExpressReceiver` のソースコード](https://github.com/slackapi/bolt/blob/master/src/ExpressReceiver.ts)をお読みください。
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
