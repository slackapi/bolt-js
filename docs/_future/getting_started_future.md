---
title: Getting started
order: 0
slug: getting-started
lang: en
layout: tutorial
permalink: /future/getting-started
---

# Getting started <span class="label-beta">BETA</span>

<div class="section-content">
This guide will walk you through getting started with next-generation developing Slack apps. This new platform enables creation of modular, shareable, and remixable building blocks within your apps that make it easier than ever to connect and reuse functionality.

You can learn more about the next-generation platform on Slack's [official introduction page](https://api.slack.com/future).
</div>

> 💡 Currently, the new Slack Platform beta is only available for workspaces on a paid plan.

---
### Limitations {#limitations}

Bolt for JavaScript supports app development using next-gen platform features like functions and workflows, development tooling through the [Slack CLI](https://api.slack.com/future/tools/cli), and all generally available [Slack Platform](https://api.slack.com/start/overview) features.

#### Bolt for JavaScript does not yet support:
- [Deployment](https://api.slack.com/future/deploy) of your next-gen app to secure and managed Slack infrastructure
- The Datastores API [datastores](https://api.slack.com/future/datastores) and related datastores functionality

> ⚠️ If you'd like to deploy your app with Slack infrastructure, consider building your next-generation application with the Deno Slack API. You can get started with that [here](https://api.slack.com/future/get-started).

---
### Setting up {#setting-up}

The next-generation experience for Bolt for JavaScript requires:
- [The Slack CLI](/bolt-js/future/getting-started#installing-the-slack-cli)
- [Node](/bolt-js/future/getting-started#installing-node)
- A workspace on a paid plan with an [Accepted Beta Terms of Service](/bolt-js/future/getting-started#accept-tos).

If you already have these dependencies set up, you can skip to the next section.

#### Installing the Slack CLI {#installing-the-slack-cli}

Follow the [Quickstart Guide](https://api.slack.com/future/quickstart) to get instructions on how to manually or automatically install the Slack CLI based on your operating system. You can skip any instructions related to installing Deno or creating an app using a Deno template.

Once you've logged into the CLI using `slack login` and verified your login using `slack auth list`, you can proceed with the instructions in this guide.

#### Installing Node {#installing-node}

Make sure your machine has the most recent version of [Node](https://nodejs.org/en/) installed. Depending on what operating system your machine uses, you can either install Node through a package manager (such as [Homebrew](https://brew.sh/) for Mac) or directly from the website.

#### Accept the Beta Terms of Service {#accept-tos}

In order to use the next-generation platform features, you'll need to accept a Terms of Service (TOS) for Slack Platform Beta in your Workspace Settings [here](https://slack.com/admin/settings#hermes_permissionfs).

> 💡 You must be an admin of your workspace to be able to access the Workspace Settings and accept the Terms of Service.

If the TOS has been accepted, you will see this view under the "Slack Platform Beta" section when navigating to the above link:

![Beta Terms of Service](../assets/beta-tos-future.png "Beta Terms of Service")

Congratulations! You're now ready to start building using the [next-generation platform](/bolt-js/future/getting-started#next-gen). 🎉 You can now proceed with creating a new app by following the instructions below or explore how to [set up an existing app](/bolt-js/future/setup-existing-app).

---

### Create a new app {#create-app}

To start, you'll need to create a Slack app. 

Create a starter next-generation app with the CLI:
```
slack create my-app -t slack-samples/bolt-js-starter-template -b future
```
This command creates an app through the CLI by cloning a specified template. In this case, the template is the [Bolt for JavaScript Starter Template](https://github.com/slack-samples/bolt-js-starter-template/tree/future) on the `future` branch.

The application will take a few moments to set up and clone the repository. Once the app is successfully created, you should see a message like this:
```
✨ my-app successfully created

🧭 Explore your project's README.md for documentation and code samples, and at any time run slack help to display a list of available commands

🧑‍🚀 Follow the steps below to try out your new project

1️⃣  Change into your project directory with: cd my-app

2️⃣  Develop locally and see changes in real-time with: slack run

3️⃣  When you're ready to deploy for production use: slack deploy

🔔 If you leave the workspace, you won’t be able to manage any apps you’ve deployed to it. Apps you deploy will belong to the workspace even if you leave the workspace
```

At this point, your app is now ready to go in the `my-app` directory! 

The starter template your app is based off of includes a "Hello World" example that demonstrates how to use the three main building blocks of next-generation Slack apps: [built-in](/bolt-js/future/built-in-functions) and [custom](/bolt-js/future/custom-functions) functions, [triggers](/bolt-js/future/triggers), and [workflows](/bolt-js/future/workflows).

**At a quick glance:**
1. **Functions** define the actions of your app
2. **Workflows** group **functions** into ordered steps
3. **Triggers** invoke **workflows**

If you'd like to test the "Hello World" example included in your template and see how functions, workflows, and triggers all tie together, read on! 📖

> 💡 This application can be the starting point for you to build your own app features. Explore on your own and dive into the code [here](https://github.com/slack-samples/bolt-js-starter-template/tree/future), or continue your journey by learning about [app manifests](/bolt-js/future/app-manifests), and how to add more [functions](/bolt-js/future/built-in-functions), [workflows](/bolt-js/future/workflows), and [triggers](/bolt-js/future/triggers) to your app!

---
### Set up your trigger {#setup-trigger}

Your app comes with a sample [workflow](https://github.com/slack-samples/bolt-js-starter-template/blob/future/manifest/workflows/sample-workflow.js) that uses a [function](https://github.com/slack-samples/bolt-js-starter-template/blob/future/manifest/functions/sample-function.js).

Kick off this workflow using the trigger defined in [this trigger configuration file](https://github.com/slack-samples/bolt-js-starter-template/blob/future/triggers/hello-world-trigger.json). We can run a command via the CLI to initialize this trigger so that we can run the workflow.

First, make sure you're in the project directory in your command line: `cd my-app`

Then, run the following command to create a trigger:
```
slack trigger create --trigger-def "triggers/hello-world-trigger.json"      
```

The above command will create a link trigger belonging to the selected workspace. Make sure to select the workspace you want and that it is appended by `(dev)`. This will create a dev instance of your app. Once the trigger is successfully created, you should see an output like this:

```
⚡ Trigger created
   Trigger ID:   [ID]
   Trigger Type: shortcut
   Trigger Name: Sample Trigger
   URL: https://slack.com/shortcuts/[ID]/[Some ID]
```
Copy this URL and paste it in your selected workspace as a message in a public channel. We'll be using the trigger to kick off our workflow later. 

---
### Run your app {#run-your-app}

Now that your app and trigger are successfully created, you can run `slack run` to start up the app. Executing `slack run` starts a local development server, syncing changes to your workspace's development version of your app.

You'll be prompted to select a workspace to install the app to&mdash;select the development instance of your workspace (you'll know it's the development version because the name has the string `(dev)` appended).

> 💡 If you don't see the workspace you'd like to use in the list, you can `CTRL + C` out of the `slack run` command and run `slack auth login`. This will allow you to authenticate in your desired workspace to have it show up in the list for `slack run`.

You'll see output in your Terminal to indicate it's running, similar to what you would see with any other Bolt for JavaScript app. You can search for the `⚡️ Bolt app is running! ⚡️` message to make sure that your app has successfully started up.

### Trigger your app's workflow {#trigger-workflow}

With your app running, access your workspace and navigate to the message you sent containing the link trigger URL in [this previous step](/bolt-js/future/getting-started#setup-trigger).

> 💡 App triggers are automatically saved as a channel bookmark under "Workflows" for easy access.

Click the "Run" button that appears on the message. A modal will appear prompting you to enter information to greet someone in your Slack workspace. Fill out the requested information.

![Hello World modal](../assets/hello-world-modal.png "Hello World modal")

Then, submit the form. In the specified channel submitted in the form, you should receive a message from the app tagging the submitted user. The message will also contain a randomly generated greeting and the message you wrote in the form.

The full app flow can be seen here:
![Hello World app](../assets/hello-world-demo.gif "Hello World app")

---

### Next steps {#next-steps}

Now we have a working instance of a next-generation app in your workspace and you've seen it in action! You can explore on your own and dive into the code yourself [here](https://github.com/slack-samples/bolt-js-starter-template/tree/future) or continue your learning journey by diving into [app manifests](/bolt-js/future/app-manifests) or looking into adding more [functions](/bolt-js/future/built-in-functions), [workflows](/bolt-js/future/workflows), and [triggers](/bolt-js/future/triggers) to your app!

<p class="alert alert_info"><ts-icon class="ts_icon_info_circle"></ts-icon>Our next-generation platform is currently in beta. [Your feedback is most welcome](/bolt-js/future/feedback) - all feedback will help shape the future platform experience!</p>

