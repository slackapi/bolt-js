---
title: Deploy your app
order: 8
slug: deploy-your-app
lang: en
layout: tutorial
permalink: /future/deploy-your-app
---

# Deploy your app<span class="label-beta">BETA</span>

> ⚠️ Using Heroku dynos to complete this tutorial counts towards your usage. [Delete your app](https://devcenter.heroku.com/articles/heroku-cli-commands#heroku-apps-destroy) as soon as you are done to control costs.

<div class="section-content">
Currently, Bolt applications cannot be deployed on Slack infrastructure. However, never fear - you can deploy your Bolt app to [the Heroku platform](https://dashboard.heroku.com/) to keep your app running at all hours of the day, not just during your development sessions!

In this guide, you will find the steps needed to prepare and deploy your app to Heroku, as well as how to inspect your activity logs and make updates to your app.
</div>

---

### Before you begin {#before-you-begin}

Before you can deploy a Bolt app to Heroku, you'll need a working Bolt app. If you haven't created one yet, [go ahead and make one](/bolt-js/future/getting-started#create-app)! If you already have an app and want features of the next-generation platform, check out the [Bolt for JavaScript setup guide](/bolt-js/future/setup-existing-app).

Additionally, you will need to have at least one trigger created for your application to confirm that your application has successfully deployed to Heroku. If you haven't created one yet, you can learn about [the different types of triggers](/bolt-js/future/triggers#types) and [how to create a trigger](/bolt-js/future/triggers#create) for tapping into your workflows.

> 💡 List your application's existing triggers by running `slack triggers list` in your project directory and selecting a workspace where it is installed!

With your app and trigger created, you can now use the `slack run` command to make sure your app starts successfully and appropriately responds to triggers from your machine.

Since we're deploying to Heroku, having a Heroku account will also be useful. If you don't have one, [create one here](https://signup.heroku.com/).

In order to manage, deploy, and debug your app on Heroku, you'll also need to [install the Heroku CLI](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up) onto your machine and authenticate using `heroku login`.

And lastly, to manage the version of your project being deployed, you'll need to [install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and initialize your app's repository using `git init` if you have not already done so.

---

### Create a Heroku app {#create-a-heroku-app}

With a Bolt app ready to go and Heroku tools installed, you're now ready to start deploying your Bolt app on Heroku!

Creating new Heroku apps will use your existing Heroku plan subscription. When getting started or deploying many small apps, we recommend starting with [Heroku's low-cost Eco Dyno plan](https://blog.heroku.com/new-low-cost-plans).

> 💡 Eligible students can apply for platform credits through the [Heroku for GitHub Student program](https://blog.heroku.com/github-student-developer-program).

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

The tokens and environment variables used by your Bolt app can be added to your Heroku app environment using the following commands:

```sh
$ heroku config:set --app HEROKU_APP_NAME SLACK_APP_TOKEN=xapp-your-app-level-token
$ heroku config:set --app HEROKU_APP_NAME SLACK_BOT_TOKEN=xoxb-your-bot-token
```

These tokens can be collected from [your App Config page](https://api.slack.com/apps). The app-level token can be found on the "Basic Information" page, while the bot-level token can be found under "OAuth & Permissions".

> 💡 Note that these tokens and variables don't necessarily have to match those used in development! For instance, you may want to use tokens for a different app or a more verbose logging output in production. This is where you would set that.

### Prepare your app for Heroku {#prepare-your-app}

For a successful deployment, you'll need to set up a few additional things in your app.

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

#### Add a Procfile {#procfile}

To specify the start command of your app for Heroku, [a special file called `Procfile`](https://devcenter.heroku.com/articles/procfile) must be created in your app's root directory.

The contents of this file will vary depending on if your app connects with [Socket Mode](https://api.slack.com/apis/connections/socket) or uses public HTTP endpoints to handle requests. To check whether Socket Mode is enabled for your application, you can either:

* Check your app's [manifest](/bolt-js/future/app-manifests) to see if `socketModeEnabled: true`, or
* Visit the "Socket Mode" section on your app's [App Config page](https://api.slack.com/apps) to check if Socket Mode has been enabled:

<img width="670" alt="The toggle for connecting with Socket Mode on the App Config page is enabled" src="https://user-images.githubusercontent.com/12901850/197868321-63fff839-a3a2-4926-ae45-93c9d88cfd41.png">

If you are using Socket Mode, your `Procfile` should contain the following:

```sh
worker: node app.js
```

While those using default web connections will have the following `Procfile`:

```sh
web: node app.js
```

With this new file saved, go ahead and commit it to your Git repository:

```sh
$ git add Procfile
$ git commit -m "Add Procfile"
```

### Deploy your app {#deploy-your-app}

After creating and configuring your Bolt and Heroku app, you're ready for deployment!

> 💾 The [triggers created with the CLI](https://api.slack.com/future/triggers#create_cli) for the local "(dev)" version of your app will continue to work after the app is deployed!

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

Logs showing the process of your app being built by Heroku will then begin to stream in. After a moment for installing dependencies, messages indicating a successful deployment should follow as so:

```sh
remote: -----> Build succeeded!
remote: -----> Discovering process types
remote:        Procfile declares types     -> worker
remote:        Default types for buildpack -> web

remote: -----> Compressing...
remote:        Done: 44.2M
remote: -----> Launching...
remote:        Released v6
remote:        https://aqueous-escarpment-85734.herokuapp.com/ deployed to Heroku

remote: Verifying deploy... done.
To https://git.heroku.com/aqueous-escarpment-85734.git
   5856f44..e322699  main -> main
branch 'main' set up to track 'heroku/main'.
```

#### Start your app

To kick things off on Heroku, you might have to scale up a dyno! Unlike the ancient creatures of an earlier era, these [dynos are lightweight containers](https://www.heroku.com/dynos) for running your app on the Heroku platform.

The [type of dyno you scale](https://devcenter.heroku.com/articles/dynos#dyno-configurations) will depend on your connection type, but should be similar to what you used in your `Procfile` since the dyno type determines which process is run.

Apps connecting with Socket Mode must stop the automatically created `web` dyno and start a `worker` dyno:

```sh
$ heroku ps:scale web=0 worker=1
```

While apps using web connections can be started with just the `web` dyno:

```sh
$ heroku ps:scale web=1
```

#### Settings for apps not using Socket Mode

Apps that use a  **Request URL** to receive events and actions from Slack should update this URL to match the web address of your new Heroku dyno. Apps that connect over Socket Mode can skip this step.

For this, we will use the "Web URL" found from `heroku info` to update the **Request URL** on both the **Interactivity & Shortcuts** page and the **Event Subscriptions** page for [your Slack app](https://api.slack.com/apps).

> 💡 Your **Request URL** will end with `/slack/events`, such as `https://aqueous-escarpment-85734.herokuapp.com/slack/events`

#### Test your Slack app

At this step your app should be live, listening for messages, events, or whatever else you have coded up! Go ahead and jump into a workspace with your app to test things out! 🚀

Now would be a terrific time to try tripping your trigger to test that your workflows are executing as expected - however, make sure to confirm that you're not running the app locally! A successfully deployed Heroku app is one that is not running locally and will still fully execute your trigger and all functionality associated with it.

### Inspecting the activity logs {#activity-logs}

Sometimes problems arise in the deployment process that can be difficult to spot. If your app doesn't seem to be running as expected, inspecting the activity logs may reveal the source of the problem.

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

### Updating the code {#update-code}

New features, functionalities, or other updates to your app are _automatically_ deployed after being committed and pushed to the `main` branch on your Heroku remote! This is all possible thanks to [the `Procfile` made earlier](#procfile).

> 🎞 Different deployments of your app can be displayed with `heroku releases`, and you can rollback to a specific release using `heroku releases:rollback v12`.

If you are using the Bolt for JavaScript Starter Template and want to see a change in action, you can update the `greeting` variable declaration in `listeners/functions/hello-world.js` like so:

```js
// listeners/functions/hello-world.js
const greeting = `${salutation}, <@${recipient}>! :sparkles: A mysterious message has arrived for you: \n\n>${message}`;
```

Then add, commit, and push your code to deploy this change to Heroku:

```sh
$ git commit -am "Add mystery to the greeting message"
$ git push -u heroku main
```

After the "Build succeeded!" and "Verifying deploy... done." messages appear, your app will have this newfound functionality! You can now test your trigger again to verify the new change.

---

### Next steps {#next-steps}

Congratulations! You've just deployed, updated, and inspected your next-generation Bolt for JavaScript app on Heroku! 🎉

You can now go forth to explore and customize your app using the different capabilities of the next-generation platform! Check out some of these features that will help you build the next-gen app of your dreams:

* [Built-in functions](/bolt-js/future/built-in-functions), a collection of Slack-native actions like sending a message or creating a channel.
* [Custom functions](/bolt-js/future/custom-functions) for creating your own building blocks that accepts inputs, does something, and provides outputs.
* [Workflows](/bolt-js/future/workflows) that combine functions into a sequence of steps that are executed in order.
* [Triggers](/bolt-js/future/triggers) for invoking a workflow in response to a link click, scheduled time, or another event.

<p class="alert alert_info"><ts-icon class="ts_icon_info_circle"></ts-icon>Our next-generation platform is currently in beta. [Your feedback is most welcome](/bolt-js/future/feedback) - all feedback will help shape the future platform experience!</p>
