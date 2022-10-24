---
title: Deploy your app
order: 8
slug: deploy-your-app
lang: en
layout: tutorial
permalink: /future/deploy-your-app
---

# Deploy your app to Heroku<span class="label-beta">BETA</span>

<div class="section-content">
Currently, Bolt applications cannot be deployed on Slack infrastructure. However, never fear - you can deploy your Bolt app to [the Heroku platform](https://dashboard.heroku.com/) to keep your app running at all hours of the day, not just during your development sessions!

In this guide, you will find the steps needed to prepare and deploy your app to Heroku, as well as how to inspect your activity logs and make updates to your app.
</div>

---

### Before you begin {#before-you-begin}

Before you can deploy a Bolt app to Heroku, you'll need a working Bolt app. If you haven't created one yet, [go ahead and make one](/bolt-js/future/getting-started#create-app)! If you already have an app and want features of the next-generation platform, check out the [Bolt for JavaScript migration guide](/bolt-js/future/migrate-existing-app). Once your app is set up, you can use the `slack run` command to make sure your app starts successfully.

Since we're deploying to Heroku, having a Heroku account will also be useful. If you don't have one, [create one here](https://signup.heroku.com/).

In order to manage, deploy, and debug your app on Heroku, you'll also need to [install the Heroku CLI](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up) onto your machine and authenticate using `heroku login`.

And lastly, to manage the version of your project being deployed, you'll need to [install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and initialize your app's repository using `git init` if you have not already done so.

---

### Create a Heroku app {#create-a-heroku-app}

With a Bolt app ready to go and Heroku tools installed, you're now ready to start deploying your Bolt app on Heroku!

#### Create a new app

From the command line, go to your project directory and start by creating a Heroku app with a unique name:

```sh
$ heroku create your-heroku-app
```

or have some fun with a random name:

```sh
$ heroku create
# Creating app... done, ⬢ aqueous-escarpment-85734
# https://aqueous-escarpment-85734.herokuapp.com/ | https://git.heroku.com/aqueous-escarpment-85734.git
```

After your Heroku app is created, you'll be given app-specific information for use in later steps. From the example above:

* App name: `aqueous-escarpment-85734`
* Web address: `https://aqueous-escarpment-85734.herokuapp.com/`
* Git remote: `https://git.heroku.com/aqueous-escarpment-85734.git`

#### Add environment variables

The tokens being used for your app (and any other environment variables) can be added to your deployed environment using the following commands:

```sh
$ heroku config:set SLACK_APP_TOKEN=xapp-your-app-level-token
$ heroku config:set SLACK_BOT_TOKEN=xoxb-your-bot-token
```

These tokens and variables don't necessarily have to match those used in development. For instance, you may want to use tokens for a different app or a more verbose logging output in production. This is where you would set that.

### Prepare your app for Heroku {#prepare-your-app}

For a successful deployment, you'll need to set up a few additional things in your app.

#### Add a Procfile

To specify the start command of your app for Heroku, [a special file called **Procfile**](https://devcenter.heroku.com/articles/procfile) must be created.

The contents of this file will vary depending if you are using Socket Mode or not, but in both cases it will be named `Procfile` and live in your app's root directory.

If you are using Socket Mode, your `Procfile` should contain the following:
```sh
worker: node app.js
```

A Slack app using default web connections will have the following `Procfile`:

```sh
web: node app.js
```

With this new file saved, go ahead and commit it to your Git repository:

```sh
$ git add Procfile
$ git commit -m "Add Procfile"
```

#### Add the Git remote

Code is deployed to Heroku by pushing code from your local repository to the Git remote from when [you created an app](#create-a-heroku-app).

You can check if this remote was automatically added by the Heroku CLI when your app was created like so:

```sh
$ git remote -v
# heroku  https://git.heroku.com/aqueous-escarpment-85734.git (fetch)
# heroku  https://git.heroku.com/aqueous-escarpment-85734.git (push)
```

But if there is no `heroku` remote, you can add one as follows:

```sh
$ git remote add heroku https://git.heroku.com/aqueous-escarpment-85734.git
```

### Deploy your app {#deploy-your-app}

After creating and configuring your Bolt and Heroku app, you're ready for deployment!

> 💾 Any [triggers created with the CLI](https://api.slack.com/future/triggers#create_cli) for the local "(dev)" version of your app will continue to fire after deploying your app!

#### Push your code

But before you can deploy, you should ensure that you have committed all of the source code your app needs to run!

You can view your unstaged changes using `git status` and commit those changes using the following flow:

```sh
# Add all remaining unstaged changes
$ git add .

# Commit the added files
$ git commit -m "Add in any final unstaged changes"
```

After adding and committing the source code of your app to the `main` branch of your repo, push it to your Heroku remote to start a deployment:

```sh
$ git push -u heroku main
```

#### Start your app

To kick things off on your Heroku app, you might have to scale up the dyno that runs your app.

For socket mode, this can be done by stopping the `web` dyno and starting the `worker` dyno:

```sh
$ heroku ps:scale web=0 worker=1
```

While apps using web connections can be started with just the `web` dyno:

```sh
$ heroku ps:scale web=1
```

#### Using a public web address

Apps using web connections (and not Socket Mode) require that the **Request URL** is set to an address that can receive events and actions from Slack.

For this, we will use the "Web URL" found from `heroku info` to update the **Request URL** on both the **Interactivity & Shortcuts** page and the **Event Subscriptions** page for [your Slack app](https://api.slack.com/apps).

> 💡 Your **Request URL** will end with `/slack/events`, such as `https://aqueous-escarpment-85734.herokuapp.com/slack/events`

#### Test your Slack app

At this step your app should be live, listening for messages, events, or whatever you have coded up! Go ahead and jump into a workspace with your app to test things out!

If you are using the [Bolt for JavaScript Starter Template `future` branch](https://github.com/slack-samples/bolt-js-starter-template/tree/future), now would be a good time to try out a link trigger and workflow. Sending a "hello" message to a channel that your bot is a member of should also elicit a response from your app.

Sometimes problems arise in the deployment process that can be difficult to spot. If your app isn't working, [inspecting the activity logs](#activity-logs) may reveal the source of the problem.

### Updating the code {#update-code}

New features, functionalities, or other updates to your app can be deployed by committing a change and pushing it to Heroku. Your app will automatically be rebuilt to reflect the latest changes on your `main` branch, with the option to roll back to any previous version using `heroku releases:rollback [RELEASE]`.

If you are using the Bolt for JavaScript Starter Template and want to see a change in action, update the greeting in `listeners/functions/hello-world.js` like so:

```js
// listeners/functions/hello-world.js
const greeting = `${salutation}, <@${recipient}>! :sparkles: A mysterious message has arrived for you: \n\n>${message}`;
```

Then add, commit, and push your code to deploy this change to Heroku:

```sh
$ git commit -am "Add mystery to the greeting message"
$ git push -u heroku main
```

After a "Build succeeded!" and "Verifying deploy... done." message appears, your app will have this newfound functionality!

### Inspecting the activity logs {#activity-logs}

To inspect the live activity logs of your deployed app, run `heroku logs --tail`.

```
2022-10-07T17:47:59.026002+00:00 app[api]: Scaled to web@0:Free worker@1:Free by user you@email.com
2022-10-07T17:48:01.606472+00:00 heroku[worker.1]: Starting process with command `node app.js`
2022-10-07T17:48:02.353986+00:00 heroku[worker.1]: State changed from starting to up
...
2022-10-07T17:48:03.620821+00:00 app[worker.1]: [DEBUG]  web-api:WebClient:1 apiCall('apps.connections.open') start
2022-10-07T17:48:03.621182+00:00 app[worker.1]: [DEBUG]  web-api:WebClient:1 will perform http request
2022-10-07T17:48:03.662470+00:00 app[worker.1]: [DEBUG]  web-api:WebClient:1 http response received
2022-10-07T17:48:03.663064+00:00 app[worker.1]: [DEBUG]  socket-mode:SocketModeClient:0 Transitioning to state: connecting:authenticated
2022-10-07T17:48:03.666960+00:00 app[worker.1]: ⚡️ Bolt app is running! ⚡️
...
2022-10-07T17:48:03.692653+00:00 app[worker.1]: [DEBUG]  socket-mode:SocketModeClient:0 Transitioning to state: connected:ready
```

Here, you will find outputs and errors from your new Heroku app, giving you insight into your app's activity!

---

### Next steps {#next-steps}

Congratulations! You've just deployed, updated, and inspected your next-generation Bolt for JavaScript app on Heroku! 🎉

You can now go forth to explore and customize your app using the different capabilities of the next-generation Platform! Check out some of these features that will help you build the next-generation app of your dreams:

* [Built-in functions](/bolt-js/future/built-in-functions), a collection of Slack-native actions like sending a message or creating a channel.
* [Custom functions](/bolt-js/future/custom-functions) for creating your own building blocks that accepts inputs, does something, and provides outputs.
* [Workflows](/bolt-js/future/workflows) that combine functions into a sequence of steps that are executed in order.
* [Triggers](/bolt-js/future/triggers) for invoking a workflow in response to a link click, scheduled time, or another event.

<p class="alert alert_info"><ts-icon class="ts_icon_info_circle"></ts-icon>Our next-generation platform is currently in beta. [Your feedback is most welcome](/bolt-js/future/feedback) - all feedback will help shape the future platform experience!</p>