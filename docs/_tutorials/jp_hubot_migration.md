---
title: アプリを Hubot から Bolt に移行する
order: 1
slug: hubot-migration
lang: ja-jp
layout: tutorial
permalink: /ja-jp/tutorial/hubot-migration
redirect_from:
  - /ja-jp/hubot-migration
---
# アプリを Hubot から Bolt に移行する

<div class="section-content">
Bolt は、Slack アプリを構築する時間と手間を減らすために作成され、Slack 開発者に最新機能とベストプラクティスを使用してアプリを構築できる単一のインターフェイスを提供します。このガイドでは、[Hubot](https://hubot.github.com/docs/) から Bolt の使用にアプリを移行するプロセスを順を追って説明します。

すでに [ボットユーザーがいるアプリ](https://api.slack.com/bot-users#getting-started) を持っている方、または Hubot コードを Bolt コードに変換するコードサンプルをお探しの方は、はじめに [Bolt リポジトリのサンプルスクリプト](https://github.com/slackapi/bolt/blob/master/examples/hubot-example/script.js) を読むとよいでしょう。
</div> 

---

### 準備段階
Hubot アプリを Bolt に変換するとき、それぞれが内部的にどのように機能しているかを把握していると助けになります。Slack の Hubot アダプターは、[RTM API](https://api.slack.com/rtm) とインターフェイス接続するように構築されています。これは、Hubot アプリに一連のワークスペースイベントを送信する WebSocket ベースの接続を使用しています。RTM API は、新しいプラットフォーム機能をサポートしておらず、特にアプリが複数のまたは大規模な Slack チームにインストールされる場合には、膨大なリソースを消費する可能性があるため、ほとんどのユースケースでお勧めできません。

デフォルトの Bolt レシーバーは、[Events API](https://api.slack.com/events-api) をサポートするように構築されています。これは、HTTP ベースのイベントサブスクリプションを使用して Bolt アプリに JSON ペイロードを送信します。Events API には、RTM にはない新しいイベントが含まれており、より詳細でスケーラブルです。ほとんどのユースケースで推奨されています。しかし、RTM API を使用し続けなければならない理由の 1 つに、アプリをホストしているサーバーにファイアウォールがあり、送信リクエストのみを許可して、受信リクエストを許可しないことが挙げられます。

Bolt アプリを作成する前に考慮に入れた方がよい違いがほかにもあります。
- Bolt の最小 Node バージョンは `v10.0.0` です。アプリをホストしているサーバーが、`v10` をサポートできない場合は、現時点でアプリを Bolt に移行することはできません。
- Bolt は、外部スクリプトをサポートしていません。Hubot アプリがアプリの機能または展開に必要な外部スクリプトを使用している場合、当面は Hubot のままでいいと思われるかもしれません。アプリに外部スクリプトがあるかどうかわからない場合は、`external-scripts.json` ファイルをチェックしてください。Slack は Bolt に引き続き投資しつつ、将来や、Slack アプリの開発と展開を簡単に行う方法について検討しています。アプリが使用する重要な外部スクリプトがある場合、[専用の Github の話題でどんなスクリプトなのか聞かせてください](https://github.com/slackapi/bolt/issues/119)。
- Hubot アプリは、Coffeescript で書かれており、Javascript にトランスパイルされます。Slack は、Bolt を Typescript で書くことで豊富な型情報にアクセスできるようにしました。Bolt アプリは、Typescript または Javascript を使用して開発できます。こちらの [サンプルスクリプト](https://github.com/slackapi/bolt/blob/master/examples/hubot-example/script.js) は、Coffeescript がどのように Javascript に変換されるかを示しています。あなたのアプリが、比較的複雑なスクリプトである場合、[Decaffeinate](https://github.com/decaffeinate/decaffeinate) などのプロジェクトを調べて、CoffeeScript を Javascript に変換するとよいかもしれません。

---

### ボットの構成
ボットユーザーがいる既存の Slack アプリへのアクセスしている方は、[次のセクションに進むことができます](#configure-what-your-bot-will-hear)。わからない場合は、[App Management ページ](https://api.slack.com/apps) に移動し、自分の Hubot アプリがあるかどうかを確認してください。ある場合は、そのアプリの認証情報を使用できます ([次のセクションに進んでください](#configure-what-your-bot-will-hear))。ない場合は、Slack アプリの作成について説明します。

#### Slack アプリを作成する
まず最初に、Slack アプリを作成します。

> 💡実際の作業を中断しないように、ワークスペースを使用することをお勧めします — [新しいワークスペースを無料で作成できます](https://api.slack.com/apps/new)。

アプリ名を入力し、インストール先のワークスペースを選択したら、`Create App` ボタンをクリックします。そうすると、アプリの **Basic Information** ページが表示されます。
 
このページには、後で必要になる重要な認証情報 (**App Credentials** ヘッダーの下の `Signing Secret` など) に加えて、アプリケーションの概要が表示されます。

ひと通り確認し、アプリのアイコンと説明を追加したら、アプリの構成 🔩 を始めましょう。

#### ボットユーザーを追加する
Slack では、Hubot アプリは会話によってユーザーと対話するようにSibelcoの設計されたボットユーザーを採用しています。

新しいアプリにボットユーザーを追加するには、左側のサイドバーの **Bot Users** をクリックしてから、**Add A Bot User** をクリックします。表示名とユーザー名を指定して、**Add Bot User** をクリックします。その他のフィールドの詳しい情報は、[API サイト](https://api.slack.com/bot-users#creating-bot-user) をご覧ください。

### ボットが理解できる内容の構成
[Events API](https://api.slack.com/bot-users#app-mentions-response) は、ボットの目と耳に相当します。これによりボットは、投稿されたメッセージ、チャンネルの変更、Slack で発生するその他のアクティビティに応答することができます。

> ⚠️ボットのイベントを構成する前に、パブリック URL が必要です。Bolt アプリを作成したことがない場合、または Events API を使用したことがない場合は、『Getting Started ガイド』の [ローカル Bolt プロジェクトの設定](https://slack.dev/bolt/ja-jp/tutorial/getting-started#setting-up-your-local-project) と [イベントの設定](https://slack.dev/bolt/ja-jp/tutorial/getting-started#setting-up-events) を参考にしてください。

#### メッセージのリッスン
すべての Hubot アプリは、デフォルトでメッセージをリッスンできるので、ボットユーザーがそうするように設定する必要があります。

[イベントの設定](https://slack.dev/bolt/ja-jp/tutorial/getting-started#setting-up-events) を行ってから、リクエスト URL を確認してください。**Subscribe to Bot Events** にスクロールダウンします。メッセージに関連する次の 4 つのイベントがあります: message channel (パブリックチャンネルのメッセージをリッスンします)、message group (プライベートチャンネルのメッセージをリッスンします)、message.im (アプリのホーム/DM スペースのメッセージをリッスンします)、message.mpim (マルチパーソン DM のメッセージをリッスンします）。

ボットがチャンネルのメッセージをリッスンするだけでよい場合は、message.channels とmessage.groups をリッスンできます。または、ボットがすべての場所のメッセージをリッスンするようにするには、4 つのメッセージイベントすべてを選択します。

ボットにリッスンさせるメッセージイベントの種類を追加して、**Save Changes** をクリックします。

#### その他のイベントのリッスン
使用していた機能に応じて、Hubot アプリはほかのイベントにも応答していたかもしれません。スクリプトを調べて、スクリプトで react、respond、presenceChange が使用されている箇所を特定してください。
- アプリで respond が使用されている場合、app_mention イベントをサブスクライブします。これで、ボットユーザーがメンションされる時をリッスンします。
- アプリで react が使用されている場合、reaction_added イベントをサブスクライブします。これにより、ボットユーザーがいるチャンネルのメッセージにリアクションが追加される時をリッスンします。
- アプリで presenceChange が使用されている場合、対応するイベントはありません。このイベントがあなたのボットの機能上重要な場合は、Hubot の使用を継続するか、アプリのロジックを変更する必要があるかもしれません。

> 💡Bolt に追加された利点として、どの [Events API イベント](https://api.slack.com/events) でもリッスンできることが挙げられます。移行が完了すれば、[ユーザーがワークスペースに参加したとき](https://api.slack.com/events/team_join) や [ユーザーがアプリで DM を開いたとき](https://api.slack.com/events/app_home_opened) など、より多くのイベントをリッスンできます。

あなたのアプリの機能に対応するイベントを追加したら、**Save Changes** をクリックします。

### スクリプトインターフェイスの変更
Bolt のインターフェイスは、可能な限り Slack API 言語に適合するように設計されましたが、Hubot は複数のサービスを抽象化するために一般化された言語を使用して設計されました。インターフェイスは似ていますが、Hubot スクリプトを Bolt スクリプトに変換するには、いくらかコードを変更する必要があります。

Bolt は、res を使用せず、Slack からの raw リクエストを公開しません。代わりに、payload のペイロード本文を使用したり、say() を使ってメッセージを送信するといった一般的な機能を使用したりできます。

> ⚙わかりやすくするために、サンプルスクリプトを Github 上に作成しました。このスクリプトは、[Bolt 用に書かれた機能と同等のものを使用している Hubot のコア機能を紹介しています](https://github.com/slackapi/bolt/blob/master/examples/hubot-example/script.js)。

#### message() を使用したパターンのリッスン
Hubot スクリプトは、hear() を使用して、一致するパターンを持つメッセージをリッスンします。代わりに、 Bolt は message() を使用して、そのパターンの string または RegExp を受け入れます。

> 👨‍💻👩‍💻コードで hear() を使用している箇所はすべて、message() を使用するように変更してください。

[メッセージのリッスンについてもっと詳しく読む](https://slack.dev/bolt/ja-jp/concepts#message-listening).

#### say() および respond() を使用したメッセージで応答する
Hubot スクリプトは、send() を使用してメッセージを同じ会話に送信し、reply() を使用して、元のメッセージを送信したユーザー宛のメンションを付けて、メッセージを同じ会話に送信します。

Bolt は、send() の代わりに say() を使用し、respond() を使用して response_url で返信を送信します。返信の冒頭にメンションを追加するには、context オブジェクトにあるユーザー ID を使用できます。たとえば、メッセージイベントの場合は次のようにできます: `say('<@${message.user}>Hello :wave:')`

Hubot の send() と Bolt の say() はほとんど同じですが、say() を使用すると [ボタン、メニューの選択、デートピッカー](https://api.slack.com/messaging/interactivity#interaction) といったインタラクティブなコンポーネントを付けてメッセージを送信できます。

> 👨‍💻👩‍💻コードで send() が使用されている箇所はすべて say() に変更してください

[メッセージへの応答についてもっと詳しく読む](https://slack.dev/bolt/ja-jp/concepts#message-sending).

#### respond と react

前のセクションで、Hubot スクリプトで respond() が使用されている場合は app_mention イベントを、react() が使用されている場合は reaction_added をサブスクライブするようにアプリを設定しました。

Bolt は、event() と呼ばれるメソッドを使用して、任意の [Events API イベント](https://api.slack.com/events) をリッスンできます。コードを変更するには、respond() を app.event(‘app_mention’) に、react() を app.event(‘reaction_added’) に変更するだけです。この点は、[サンプルスクリプト](https://github.com/slackapi/bolt/blob/master/examples/hubot-example/script.js) で詳しく説明されています。

> 👨‍💻👩‍💻コードで respond() が使用されている箇所はすべて、app.event ('app_mention') を使用するように変更してください。react が使用されている箇所はすべて app.event('reaction_added') に変更してください。

[イベントのリッスンについてもっと詳しく読む](https://slack.dev/bolt/ja-jp/concepts#event-listening).

### Bolt で Web API メソッドを使用する
Hubot では、@slack/client から WebClient パッケージをインポートする必要がありました。Bolt では、app.client からアクセスできる WebClient インスタンスがデフォルトでインポートされます。

組み込みの WebClient を使用するには、アプリをインスタンス化するために使用されるトークン、またはリクエストの送信元のチームに関連付けられているトークンを渡す必要があります。これは、リスナー関数に渡された context オブジェクトにあります。たとえば、メッセージにリアクションを追加するには、次を使用します:

```javascript
app.message('react', async ({ message, context }) => {
  try {
      const result = await app.client.reactions.add({
      	token: context.botToken,
        name: ‘star’,
        channel: message.channel,
        timestamp: message.ts
    });
  }
  catch (error) {
    console.error(error);
  }
});
```

> 👨‍💻👩‍💻app.client で組み込みのクライアントを使用するように、Web API 呼び出しを変更してください。

[Bolt での Web API の使用についてもっと詳しく読む。](https://slack.dev/bolt/ja-jp/concepts#web-api)

### Bolt でのミドルウェアの使用
Hubot には、受信 (リスナーが呼び出される前に実行される)、リスナー (一致するすべてのリスナーに対して実行される)、応答 (送信されるすべての応答に対して実行される) という 3 種類のミドルウェアがあります。

Bolt には、グローバルとリスナーという 2 種類のミドルウェアしかありません。
- グローバルミドルウェアは、リスナーミドルウェアが呼び出される前に実行されます。Bolt アプリ自体に付属しています。[Bolt のグローバルミドルウェアについてもっと詳しく読む。](https://slack.dev/bolt/ja-jp/concepts#global-middleware).
- リスナーミドルウェアは、付属するリスナー関数に対してのみ実行されます。[Bolt のリスナーミドルウェアについてもっと詳しく読む。](https://slack.dev/bolt/ja-jp/concepts#listener-middleware)

Bolt では、グローバルとリスナーというミドルウェアはいずれも、next() を呼び出して実行の制御を次のミドルウェアに渡す必要があります。ミドルウェアが実行中にエラーを検出した場合、Error を next() に渡すことができ、エラーはその前に実行されたミドルウェアチェーンにバブルアップされます。

既存のミドルウェア関数を移行するには、Hubot の受信ミドルウェアは、Bolt のグローバルミドルウェアのユースケースと対応しています。Hubot と Bolt のリスナーミドルウェアは、ほぼ同じです。Hubot の応答ミドルウェアを移行するには、後処理関数と呼ばれる Bolt のコンセプトを使用します。

ミドルウェアがイベントの後処理を実行する必要がある場合、undefined で呼び出すのではなく、後処理関数を使用して next() を呼び出すことができます。後処理関数は、ミドルウェア関数が next() を呼び出すのと同じ方法で done() を呼び出す必要があります(Error で呼び出すことも可能) 。

### ブレインを会話ストアに移行する
Hubot には、ブレインと呼ばれるインメモリストアがあります。これによって、Hubot スクリプトはデータの基本部分を get および set することができます。Bolt は、会話ストアと呼ばれる、get()`/`set() インターフェイスを含むグローバルミドルウェアを使用します。

デフォルトの組み込み会話ストアは Hubot に似たインメモリストアを使用し、ミリ秒単位で有効期限を設定できます。会話の状態を get および set する方法は 2 つあります。

- 会話 ID を使用して app.convoStore.get() を呼び出して会話の状態を取得する方法と、会話 ID、会話の状態 (キーと値のペア) 、オプションで expriesAt 時間 (ミリ秒) を使用して app.convoStore.set() を呼び出す方法です。
- リスナーミドルウェアでは、context.updateConversation() を呼び出して更新された会話の状態を得るか、context.conversation を使用して現在の会話の状態にアクセスします。

アプリのインスタンスが複数実行されている場合、組み込みの会話ストアはプロセス間で共有されないため、データベースから会話の状態を取得する会話ストアを実装することをお勧めします。

[会話ストアについてもっと詳しく読む](https://slack.dev/bolt/ja-jp/concepts#conversation-store).

### 次のステップ
ここまでで、Hubot アプリを Bolt アプリに変換できたことでしょう！✨⚡

人目を引く新しい Bolt アプリを手に入れた今、さらにパワーアップする方法を調べることができます。
- [ボタンやメニュー選択](https://api.slack.com/messaging/interactivity#interaction) などの双方向性を追加することを検討してください。これらの機能は、Hubot ではサポートされていませんでしたが、アプリが Slack にメッセージを送信するときにコンテキストアクションを含めることができるようになります。
- こちらの [ドキュメント](https://slack.dev/bolt/ja-jp/concepts) を読んで、Bolt でほかに何ができるかお確かめください。
- イベントやインタラクティブコンポーネントの使用方法を示す [サンプルアプリ](https://glitch.com/~slack-bolt) をご覧ください。

開発中に問題が発生した場合は、Slack の開発者サポートチーム[developers@slack.com](mailto:developers@slack.com)までお問合せください。フレームワークで問題が発生した場合は、[Githubでイシューを開いてください](https://github.com/slackapi/bolt/issues/new)。
