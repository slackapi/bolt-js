---
title: 会話ストア
lang: ja-jp
slug: conversation-store
order: 3
---

<div class="section-content">
Bolt は、会話 (conversation) に関連する state を設定および取得する store をサポートしています。conversation store には以下の 2 つのメソッドがあります。
* `set()` は会話の state を変更します。`set()` は、文字列型の `conversationId`、任意の型の `value`、およびオプションの数値型の `expiresAt` を必要とします。`set()` は `Promise` を返します。
* `get()` は store から会話の state を取得します。`get()` は文字列型の `conversationId` を必要とし、その会話の state とともに Promise を返します。

`conversationContext()` は、他のミドルウェアによる会話の更新を可能にする組み込みの[グローバルミドルウェア](#global-middleware)です。イベントを受け取ると、ミドルウェア関数は `context.updateConversation()` を使用して状態を設定でき、`context.conversation` を使用してその state を取得できます。

組み込みの conversation store は、シンプルに会話の state をメモリーに格納します。状況によってはこれで十分ですが、アプリのインスタンスが複数実行されている場合、状態はプロセス間で共有されないため、データベースを使用して会話の state を取得する conversation store を実装することをおすすめします。
</div>

```javascript
const app = new App({
  token,
  signingSecret,
  // クラスを作成する感じで
  convoStore: new simpleConvoStore()
});

// Firebaseのようなデータベースを使い conversation store を実装
class simpleConvoStore {
  set(conversationId, value, expiresAt) {
    // Promise を返す
    return db().ref('conversations/' + conversationId).set({ value, expiresAt });
  }

  get(conversationId) {
    // Promise を返す
    return new Promise((resolve, reject) => {
      db().ref('conversations/' + conversationId).once('value').then((result) => {
        if (result !== undefined) {
          if (result.expiresAt !== undefined && Date.now() > result.expiresAt) {
            db().ref('conversations/' + conversationId).delete();

            reject(new Error('Conversation expired'));
          }
          resolve(result.value)
        } else {
          // Conversation が存在しないエラー
          reject(new Error('Conversation not found'));
        }
      });
    });
  }
}
```