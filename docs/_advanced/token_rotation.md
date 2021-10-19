---
title: Token rotation
lang: en
slug: token-rotation
order: 3
---

<div class="section-content">
Supported in Bolt for JavaScript as of v3.5.0, token rotation provides an extra layer of security for your access tokens and is defined by the [OAuth V2 RFC](https://datatracker.ietf.org/doc/html/rfc6749#section-10.4). 

Instead of an access token representing an existing installation of your Slack app indefinitely, with token rotation enabled, access tokens expire. A refresh token acts as a long-lived way to refresh your access tokens.

Bolt for JavaScript supports and will handle token rotation automatically so long as the [built-in OAuth](https://slack.dev/bolt-js/concepts#authenticating-oauth) functionality is used.

For more information about token rotation, please see the [documentation](https://api.slack.com/authentication/rotation).
</div>
