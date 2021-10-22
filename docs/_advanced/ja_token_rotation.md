---
title: トークンのローテーション
lang: ja-jp
slug: token-rotation
order: 3
---

<div class="section-content">
Bolt for JavaScript `v3.5.0` から, [OAuth V2 RFC](https://datatracker.ietf.org/doc/html/rfc6749#section-10.4)で定義されているトークンローテーションはアクセストークンのセキュリティーをより一層強化します。

トークンローテションを有効にすると既存のインストレーションを表す無期限のアクセストークンの有効期限は切れます。リフレッシュトークンはアクセストークンを再生成する長期的な方法として利用できます。

組み込みの [OAuth 機能](https://slack.dev/bolt-js/ja-jp/concepts#authenticating-oauth)を使われている限り、Bolt for JavaScript は自動的にトークンローテーションをサポートします。

トークンローテーションについてのより詳細な情報は [API ドキュメント](https://api.slack.com/authentication/rotation)を参照してください。
</div>
