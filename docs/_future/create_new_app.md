---
title: Create a new app
order: 0
slug: create-new-app
lang: en
layout: tutorial
permalink: /future/create-new-app
---
# Create a new app <span class="label-beta">BETA</span>

<div class="section-content">
This guide will walk you through getting started with the Slack CLI as well as how to create a new app in the CLI with Bolt JS.

The application built in this tutorial will be a "Request Time Off" app that allows a user to submit a Request Time Off, which then sends a message to their manager, who can either approve or deny the request. 
</div>

When you’re finished, you’ll have this ⚡️[Bolt JS Request Time Off app](https://github.com/slack-samples/bolt-js-request-time-off) to run, modify, and make your own.

---

### Prerequisites {#prerequisites}
Before getting started, you'll need to get the Slack CLI set up on your machine. You can follow the [Quickstart Guide](https://api.slack.com/future/quickstart) to get instructions on how to manually or automatically install it. 

Since we won't be using Deno in this guide, you can skip any instructions related to installing Deno or creating an app - once you've logged into the CLI using `slack auth login` and verified your login using `slack auth list`, you can proceed with the tutorial below.

> 💡 When logging into a workspace using the CLI, we recommend using a workspace where you won't disrupt real work getting done — [you can create a new one for free](https://slack.com/get-started#create).

---

### Create an app {#create-an-app}
Before you start developing with Bolt, you'll want to create a Slack app. 

To create the app, you'll run the following command:
```
slack create my-app -t slack-samples/bolt-js-request-time-off
```
This command creates an app through the CLI using a template. In this case, it's using the Bolt JS Request Time Off application which can be found [here](https://github.com/slack-samples/bolt-js-request-time-off). 

The application will take a few moments to set up. Once the app is successfully created, you should see a message like this:
```
✨ my-app successfully created

🧭 Explore your project's README.md for documentation and code samples, and at any time run hermes help to display a list of available commands

🧑‍🚀 Follow the steps below to try out your new project

1️⃣  Change into your project directory with: cd my-app

2️⃣  Develop locally and see changes in real-time with: slack run

3️⃣  When you're ready to deploy for production use: slack deploy

🔔 If you leave the workspace, you won’t be able to manage any apps you’ve deployed to it. Apps you deploy will belong to the workspace even if you leave the workspace
```

You can now explore the `my-app` directory!

---
### Setup your trigger {#setup-trigger}
In order to utilize any of the pre-existing functionality in the Request Time Off app, you'll need to create a trigger prior to running your app. Enter the project directory: `cd my-app`

Then, run the following command to create a trigger using the `link-shortcut.json` configuration file that initializes your trigger:
```
slack triggers create --trigger-def="triggers/link-shortcut.json"      
```

The above command will automatically install the trigger to the selected workspace. Once the trigger is successfully created, you should see an output like this:
```
⚡ Trigger created
   Trigger ID:   [ID]
   Trigger Type: shortcut
   Trigger Name: Take Your Time
   URL: https://slack.com/shortcuts/[ID]/[Some ID]
```
The URL will be what you use to run your trigger. Copy the URL of the trigger for later.

---
### Run your app {#run-your-app}
Now that your app and trigger are successfully created, let's try running it!

Run `slack run` to start up the app. You'll be prompted to select a workspace to install the app to - select the workspace you're planning to use for development. If you don't see the workspace you'd like to use in the list, you can run `slack auth login` and authenticate in the desired workspace to have it show up.

Once the app is successfully run, you'll see output in your Terminal to indicate it's running similar to what you would see with any other Bolt JS app. You can search for the `⚡️ Bolt app is running! ⚡️` message to indicate that your app has successfully started up.

With your app running, access your workspace and paste the Shortcut URL from your trigger into a public channel. Click the "Run" button that appears and a modal will appear prompting you to enter information to request time off. To test your app properly, we recommend entering your own Slack username in the "Manager" field.

> Insert Screenshot here of form

Then, submit the form. You should receive a message from the app with information about the requested time off as well as an "Approve" and "Deny" button. Once either button is selected, you should then receive a message from the app notifying you of the status of your request.

The full app flow can be seen here:
> Insert GIF here of how the app flow will look

---
### Triggers {#triggers}

Here, we can explain how the trigger was created and what went into it and break down that `link-shortcut.json` file.

We can also link out to the Triggers page for more info.

---
### Workflows {#workflows}

Then, we can work backwards to identify the workflow and how it's declared.

---
### Functions {#functions}

Then, we can work backwards more and identify the functions we declared.
Add link to built in functions and custom functions pages here.

---
### Actions {#actions}

Then, we can talk about handlers and actions and all that good stuff.

---
### Views {#views}
Finally, we can add in Sarah's example here of how to add in a view with an action (open modal example!)

#### Opening modals
[Modals](https://api.slack.com/block-kit/surfaces/modals) can be created by calling the `views.open` method. The method requires you to pass a valid [view payload](https://api.slack.com/reference/block-kit/views).

To open or update a modal from a Slack Function [interactivity handler](https://api.slack.com/future/view-events), pass the `interactivity_pointer` you received from your event payload in your `views.open` method.

