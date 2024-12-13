# Deploying to Heroku ⚡️ Bolt for JavaScript

> Slack app example from 📚 [Deploying to Heroku with Bolt for JavaScript][1]

## Overview

This is a Slack app built with the [Bolt for JavaScript framework][2] that showcases
deploying to the [Heroku platform][3].

## Deploy to Heroku

### 1. Initialize a Git repository

```zsh
# Initialize Git repository
git init

# Commit this project
git add .
git commit -am "Initial commit"

# Rename master to main (optional)
git branch -m main
```

### 2. Create a Heroku app

```zsh
heroku create
```

### 3. Set Heroku environment variables

```zsh
heroku config:set SLACK_SIGNING_SECRET=<your-signing-secret>
heroku config:set SLACK_BOT_TOKEN=xoxb-<your-bot-token>
```

### 4. Deploy to Heroku

```zsh
# Deploy to Heroku
git push heroku main

# Start web server on Heroku
heroku ps:scale web=1
```

### 5. Create Slack App

1. Follow the [Getting Started with Bolt for JavaScript][4] guide to:
    - Create a Slack app
    - Add required scopes
    - Subscribe to required events 
2. Follow the [Deploying to Heroku with Bolt for JavaScript][1] guide to:
    - Update your **Request URL** for actions and events

### 6. Bonus: Deploy to Heroku with one click

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/slackapi/bolt-js)

[1]: https://tools.slack.dev/bolt-js/deployments/heroku/
[2]: https://tools.slack.dev/bolt-js/
[3]: https://heroku.com/
[4]: https://tools.slack.dev/bolt-js/getting-started
