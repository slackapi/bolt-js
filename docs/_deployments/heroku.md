---
title: Deploy to Heroku
order: 0
slug: heroku
lang: en
layout: tutorial
permalink: /deployments/heroku
redirect_from:
  - /deployments
---
# Deploy to Heroku

<div class="section-content">
This guide is meant to walk you through preparing and deploying a Slack app using Bolt for JavaScript to the [Heroku cloud platform](https://heroku.com/). Along the way, we’ll download the [Getting Started app](/bolt-js/tutorials/getting-started), prepare it for Heroku, create a Heroku instance, and deploy the app.
</div>

---

### Setup the Heroku tools

First off, you will want to setup the Heroku tools on your local machine. This will help you manage, deploy, and debug your app on the Heroku platform.

**Install the Heroku CLI**

The Heroku tools are available as a Command Line Interface (CLI). Go ahead and [install the Heroku CLI for macOS, Windows, or Linux](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up). On macOS, you can run the command:

```shell
brew install heroku/brew/heroku
```

When the install is complete, you will be able to use the `heroku` command in your terminal.

> 💡 If the `heroku` command is not found, you may need to open a new terminal session.

**Log into the Heroku CLI**

The Heroku CLI connects your local machine with your Heroku account so that you can create and manage apps. You can log into the Heroku CLI with the command:

```shell
heroku login
```

**Confirm login for Heroku CLI**

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

### Get the Bolt Slack app

We're going to use the app that you created in the [Getting Started](/bolt-js/tutorials/getting_started) to learn how to prepare and deploy an app to Heroku.

> 💡 If you have an existing Bolt Slack app that you want to deploy, you should be able to follow along as well.

Let's start by getting a fresh copy of the _Getting Started_ app:

```shell
git clone https://github.com/mwbrooks/bolt-js-getting-started-app.git
cd bolt-js-getting-started-app/
```

Perfect! Now that we have the app, let's move onto preparing it for Heroku.

---

### Prepare the app for Heroku

Heroku is a flexible platform that uses a few conventions to understand how to host your app.

- Track your app in a Git repository `<details>`
- Add a Heroku Git remote
- Add a Procfile
- Existing apps should review https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment

---

### Deploy the app

- `heroku ps:scale web=1`
- `git push heroku main`
- `heroku open`

---

### Deploy an update

- Update something in the code
- `git commit`
- `git push heroku main`
- `heroku open`

---

### Next steps

<!-- Deploying Heroku with OAuth -->