---
title: Deploying to Heroku
order: 0
slug: heroku
lang: en
layout: tutorial
permalink: /deployments/heroku
redirect_from:
  - /deployments
---
# Deploying to Heroku

<div class="section-content">
This guide is meant to walk you through preparing and deploying a Slack app using [Bolt for JavaScript](/bolt-js) to the [Heroku platform](https://heroku.com/). Along the way, we’ll download regular Bolt Slack app, prepare it for Heroku, and deploy it on your Heroku account.
</div>

---

### Get a Bolt Slack app

Let's get started! We're going to use the app that you created in the [Getting Started with Bolt for JavaScript](/bolt-js/tutorials/getting_started) guide. It's a regular Bolt Slack app that we use to learn how to prepare and deploy an app to Heroku.

Get a fresh copy of the _Getting Started with Bolt for JavaScript_ app:

```shell
git clone https://github.com/slackapi/bolt-js-getting-started-app.git
cd bolt-js-getting-started-app/
```

> 💡 You can also follow along with an existing Bolt app.

Perfect! Now that we have the app, let's move onto preparing it for Heroku.

---

### Prepare the app for Heroku

Heroku is a flexible platform that uses a few conventions to understand how to host your app. In this section, we'll update your app to be compatible with Heroku.

**1. Add a Procfile**

Every Heroku app uses a special file called `Procfile` that tells Heroku how to start your app. You can now create a new file called `Procfile` (without any extension) and add the following code:

```yaml
web: node app.js
```

**2. A few extra steps for existing apps**

Are you following this guide with an existing app that you created? If so, please read about [preparing a codebase for Heroku guide](https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment#4-listen-on-the-correct-port). The guide will help you setup a Git repository, listen on the correct port, and think about provisioning data storage.

We're done preparing your app for Heroku! Now we can setup the Heroku tools on your local machine.

---

### Setup the Heroku tools

First off, you will want to setup the Heroku tools on your local machine. This will help you manage, deploy, and debug your app on the Heroku platform.

**1. Install the Heroku CLI**

The Heroku tools are available as a Command Line Interface (CLI). Go ahead and [install the Heroku CLI for macOS, Windows, or Linux](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up). On macOS, you can run the command:

```shell
brew install heroku/brew/heroku
```

When the install is complete, you will be able to use the `heroku` command in your terminal.

> 💡 If the `heroku` command is not found, you may need to open a new terminal session.

**2. Log into the Heroku CLI**

The Heroku CLI connects your local machine with your Heroku account so that you can create and manage apps. You can log into the Heroku CLI with the command:

```shell
heroku login
```

**3. Confirm login for Heroku CLI**

Lastly, let's double-check that you're logged in by displaying the account that's currently connected to your Heroku CLI:

```shell
heroku auth:whoami
# Output: <your Heroku account>
```

You're all setup with the Heroku tools! Now let's move onto the exciting step of creating a instance in the Heroku cloud.

---

### Create an app on Heroku

Now we can create an app on Heroku. You can run the command:

```shell
heroku create
```

When the app is created, Heroku will also create a git remote repository.

---

### Deploy the app

- `heroku ps:scale web=1`
- `git push heroku main`
- `heroku open`

---

### Update the app

- Update something in the code
- `git commit`
- `git push heroku main`
- `heroku open`

---

### Next steps

<!-- Deploying Heroku with OAuth -->