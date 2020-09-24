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
This guide will walk you through preparing and deploying a Slack app using [Bolt for JavaScript](/bolt-js) and the [Heroku platform](https://heroku.com/). Along the way, we’ll download a Bolt Slack app, prepare it for Heroku, and deploy it.
</div>

---

### Get a Bolt Slack app

We'll continue from the [Getting Started with Bolt for JavaScript](/bolt-js/tutorials/getting_started) guide to learn how to prepare and deploy the Getting Started app to Heroku.

Download the Getting Started app and change into its directory:

```shell
git clone https://github.com/slackapi/bolt-js-getting-started-app.git
cd bolt-js-getting-started-app/
```

> 💡 You also can follow along with an existing Bolt app and we'll mention any extra steps that are needed.

Now that you have the app, let's prepare it for Heroku.

---

### Prepare the app for Heroku

Heroku is a flexible platform that uses a few conventions to understand how to host your app. In this section, we'll update your app to use those conventions.

**1. Use a Git repository**

Before you can deploy your app to Heroku, you need to [install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git), initialize a local Git repository, and commit your code to it.

> 💡 You can skip this step if you Git cloned the Getting Started app in the previous section.

To initialize a local Git repository, run the command:

```shell
git init
```

Now add your code and commit it to the repository:

```shell
git add .
git commit -m "Initial commit"
```

**2. Add a Procfile**

Every Heroku app uses a special file called `Procfile` that tells Heroku how to start your app. You can now create a new file called `Procfile` (without any extension) with the following code:

```yaml
web: node app.js
```

Once you've saved the file, let's commit it to your Git repository:

```shell
git add Procfile
git commit -m "Add Procfile"
```

**3. Extra steps for existing apps**

Are you following this guide with an existing app that you created? If so, please review [preparing a codebase for Heroku](https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment#4-listen-on-the-correct-port) to listen on the correct port and think about data storage provisioning.

---

### Setup the Heroku tools

Now we can set up the Heroku tools on your local machine. These tools will help you manage, deploy, and debug your app on Heroku's platform.

**1. Install the Heroku CLI**

The Heroku tools are available as a Command Line Interface (CLI). Go ahead and [install the Heroku CLI for macOS, Windows, or Linux](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up). On macOS, you can run the command:

```shell
brew install heroku/brew/heroku
```

Once the install is complete, we can test the Heroku CLI by displaying the available commands:

```shell
heroku help
```

> 💡 If the `heroku` command is not found, you can update your path by opening a new terminal session/tab.

**2. Log into the Heroku CLI**

The Heroku CLI connects your local machine with your Heroku account. [Sign up for a free Heroku account](https://heroku.com) and then log into the Heroku CLI with the following command:

```shell
heroku login
```
> 💡 If you're behind a firewall, you may need to [set the proxy environment variables](https://devcenter.heroku.com/articles/using-the-cli#using-an-http-proxy) for the Heroku CLI.

**3. Confirm you're logged into the Heroku CLI**

Let's check that you're logged in by displaying the account currently connected to your Heroku CLI:

```shell
heroku auth:whoami
```

You're all setup with the Heroku tools! Now let's move onto the exciting step of creating an app on Heroku.

---

### Create an app on Heroku

It’s time to [create a Heroku app](https://devcenter.heroku.com/articles/creating-apps) using the tools that you just installed.

When you create an app, you can choose a unique name or have Heroku generate a random one.

> 💡 You can [rename a Heroku app](https://devcenter.heroku.com/articles/renaming-apps) at any time, but you may need to update your Git remote and app URL.

Create an app on Heroku with a unique name:

```shell
heroku create my-unique-bolt-app-name
```

or, have some fun with a random name:

```shell
heroku create
# Creating sharp-rain-871... done, stack is heroku-18
# https://sharp-rain-871.herokuapp.com/ | https://git.heroku.com/sharp-rain-871.git
# Git remote heroku added
```

After your app is created, there are a few things that are worth your attention. In the example above, the app is named `sharp-rain-871`, the web address is `https://sharp-rain-871.herokuapp.com/`, and Heroku initialized an empty Git repository at `https://git.heroku.com/sharp-rain-871.git`.

The Heroku CLI automatically adds a Git remote called `heroku` to your local repository. You can view your Git remotes to confirm `heroku` exists:

```shell
git remote -v
# heroku	https://git.heroku.com/sharp-rain-871.git (fetch)
# heroku	https://git.heroku.com/sharp-rain-871.git (push)
```

Now that we have prepared your local app and created a Heroku app, the next step is to deploy it!

---

### Deploy the app

To deploy the app, we're going to push your app to a Heroku web server, update your Slack app's settings and then say "hello" to your brand new Heroku app. ✨

**1. Deploy to a Heroku web server**

When deploying an app to Heroku, you'll typically use the `git push` command. This will push your code from your local repository to your `heroku` remote repository.

You can now deploy your app with the command:

```shell
git push heroku main
```

> 💡 Heroku deploys code that's pushed to the [master or main branches](https://devcenter.heroku.com/articles/git-branches). Pushing to other branches does nothing.

Now that your code is deployed, we need to start a web server instance using the command:

```shell
heroku ps:scale web=1
```

**2. Update your Slack app's setting**

Back in the [Getting Started guide][getting-started-guide], you used ngrok to receive HTTP requests for events and interactivity. Now that your app is on Heroku, we need to update the **Request URLs** to be your Heroku app's web address.

You can update the **Request URL** with the following steps:

1. Browse to your [Slack Apps page](https://api.slack.com/apps)
1. Select your app
1. Select **Interactivity & Shortcuts** from the side bar
  - Update the **Request URL** to xxx
1. Select **Event Subscriptions** from the side bar
  - Update the **Request URL** to xxx

**3. Test your Slack app**

It's time test your Slack app by saying "hello" (lower-case) in a channel that your app has joined. Just like in the [Getting Started guide](https://slack.dev/bolt-js/tutorial/getting-started#sending-and-responding-to-actions), your app should respond.

---

### Deploying an update

As you build your Slack app, you'll want to continue deploying updates to Heroku. The common steps are to make a change, commit it to Git, and then push it to Heroku.

Let's update your your app to respond to "goodbye" by adding the following code to `app.js` ([source code on GitHub](https://github.com)):

```javascript
// Listens to incoming messages that contain "goodbye"
app.message('goodbye', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`See ya later, <@${message.user}> :wave:`);
});
```

Commit the changes to your local Git respository:

```shell
git commit -am "Say 'goodbye' to a person"
```

Deploy the update by pushing to your `heroku` remote:

```shell
git push heroku main
```

When the deploy is complete, you can open a Slack channel that your app has joined and say "goodbye" (lower-case). You should see a friendly goodbye from your Slack app:

> See ya later, Michael 👋

---

### Next steps

- Heroku free plan limitations
- Deploying to Heroku with OAuth
- Heroku official next steps
<!-- Gotchas -->
<!-- Deploying Heroku with OAuth -->

[getting-started-guide]: https://slack.dev/bolt-js/tutorial/getting-started