---
title: トークンのローテーション
lang: ja-jp
slug: /concepts/token-rotation
---


Bolt for JavaScript [v3.5.0](https://github.com/slackapi/bolt-js/releases/tag/%40slack%2Fbolt%403.5.0) から、アクセストークンのさらなるセキュリティ強化のレイヤーであるトークンローテーションの機能に対応しています。トークンローテーションは [OAuth V2 の RFC](https://datatracker.ietf.org/doc/html/rfc6749#section-10.4) で規定されているものです。

既存の Slack アプリではアクセストークンが無期限に存在し続けるのに対して、トークンローテーションを有効にしたアプリではアクセストークンが失効するようになります。リフレッシュトークンを利用して、アクセストークンを長期間にわたって更新し続けることができます。

[Bolt for JavaScript の組み込みの OAuth 機能](/concepts/authenticating-oauth) を使用していれば、Bolt for JavaScript が自動的にトークンローテーションの処理をハンドリングします。

トークンローテーションに関する詳細は [API ドキュメント](https://api.slack.com/authentication/rotation)を参照してください。

