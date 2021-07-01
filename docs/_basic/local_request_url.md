---
title: Using a local HTTP request url
lang: en
slug: local-request-url
order: 17
---

<div class="section-content">
If you'd like your app to communicate with Slack via HTTP, you'll likely want to set up a public, static HTTP url for local development and set that as your Request URL in your app configuration at [api.slack.com](https://api.slack.com/apps/). 

A development proxy like [ngrok](https://ngrok.com/) will create a public URL and tunnel requests to your own development environment. We've written a separate tutorial about [using ngrok with Slack for local development](https://api.slack.com/tutorials/tunneling-with-ngrok) that should help you get everything set up.

Once you’ve installed a development proxy, run it to begin forwarding requests to a specific port (we use port `3000` by default, but if you customized the port used to initialize your app, use that port instead):

![Running ngrok](assets/ngrok.gif "Running ngrok")

The output should show a generated URL that you can use (we recommend the one that starts with `https://`). This URL will be the base of your Request URL, in this case: `https://8e8ec2d7.ngrok.io`

⚙️ Bolt uses the `/slack/events` endpoint to listen to all incoming requests (whether shortcuts, events, or interactivity payloads). When configuring endpoints within your app configuration, you'll append `/slack/events` to all Request URLs. For example, a full Request URL would be `https://8e8ec2d7.ngrok.io/slack/events`.
</div>

```shell
ngrok http 3000
```