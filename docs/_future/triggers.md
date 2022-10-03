---
title: Triggers
order: 5
slug: triggers
lang: en
layout: tutorial
permalink: /future/triggers
---
# Triggers <span class="label-beta">BETA</span>

<div class="section-content">
Triggers are but one of the three building blocks that make up next-generation Slack apps. You will encounter all three as you walk the path of building your Slack app:

1. Functions are what define the actions of your app
2. Workflows are made up of Functions
3. Triggers are how Workflows are executed (⬅️ you are here)

Since Triggers kick off Workflows, you need to have a Workflow before you can create a Trigger. Acquaint yourself with the [documentation on Workflows](/bolt-js/future/workflows), then head back here. We'll wait!

Once you've created a Workflow, you can dive into the guide below! 
</div>


---

### Create a Trigger {#create}

Triggers can be added to Workflows in two ways:

* [**You can add Triggers with the CLI.**](#create_cli) These static Triggers are created only once. You create them with the Slack CLI, attach them to your app's Workflow, and that's that. 

* [**You can add Triggers at runtime.**](#create_runtime) These dynamic Triggers are created at any step of a Workflow so they can incorporate data acquired from other Workflow steps.

#### Create a Trigger with the CLI {#create_cli}

**1. Create a Trigger File**

Triggers created with the CLI are designed using Trigger Files. The Trigger File you create will supply the information about how you want your Trigger to work. **For Bolt for JavaScript apps, you will need to create JSON trigger files.**

The specifics of the Trigger File's structure will depend on what [type of Trigger](#types) you want to use.

The Hello World app from the Bolt for JavaScript starter template uses a Link Trigger, which is one of several [Trigger types](#types). You can view its Trigger File [here](https://github.com/slack-samples/bolt-js-starter-template/blob/future/triggers/hello-world-trigger.json).

**2. Run the** `trigger create` **command**

Use the `trigger create` command to create your desired Trigger by pointing to a Trigger File. 

```bash
slack trigger create --trigger-def "path/to/trigger.json"
```

> 💡 In order to run the trigger and launch the full workflow, your application must be running via `slack run`.

<p class="alert alert_info"><ts-icon class="ts_icon_info_circle"></ts-icon>**Slack CLI built-in documentation**<br>
Use `slack trigger --help`  to easily access information on the `trigger` command's flags and subcommands.</p>

#### Create a Trigger at runtime {#create_runtime}

The logic of a runtime Trigger lies within a Function's code. The specific payload is dependent on the [type of Trigger](#types) you use.

Within your `manifest/functions` folder, you'll have the Functions that are the steps making up your Workflow. Within this folder is where you can create a Trigger within the relevant `<function>.js` file. 

The `create` method for runtime Triggers takes the form of `client.workflows.triggers.create()`. Within that method you can leverage `inputs` acquired in previous steps (i.e. with Functions) within the Workflow.

```js
const triggerResponse = await client.workflows.triggers.create({
  type: "shortcut",
  name: "My Trigger",
  workflow: "#/workflows/my_workflow",
  inputs: {
    input_name: {
      value: "value",
    }
  }
});
```

The response will have a property called `ok`. If `true`, then the Trigger was created, and the `trigger` property will be populated.

Your response will include a `trigger.id`; be sure to store it! You will use that to `update` or `delete` the Trigger if need be.

#### Development and production Triggers

The Triggers you create when you're running your app locally in a development environment (with the `slack run` command) will not work when you [deploy your app](/bolt-js/future/deploy-your-app). You'll need to `create` any Triggers again with the CLI.

---

### Update a Trigger {#update}

Make an update to a preexisting Trigger by using the `slack trigger update` command. Provide the same payload you used to create the trigger *in its entirety*, in addition to the Trigger ID.

```bash
slack trigger update --trigger-id Ft123ABC --trigger-def "path/to/trigger.json"
```
---

### Delete a Trigger {#delete}

You can delete a Trigger with the `slack trigger delete` command.

```bash
slack trigger delete --trigger-id FtABC123
```
---

### Trigger types {#types}

There are four types of Triggers, each one having its own specific implementation. To learn more about each trigger, visit the linked pages below.

| Trigger Type                     | Use case                                                      |
|----------------------------------|---------------------------------------------------------------|
| [Link Triggers](https://api.slack.com/future/triggers/link)           | Invoke a Workflow from anywhere in Slack                      |
| [Scheduled Triggers](https://api.slack.com/future/triggers/scheduled) | Invoke a Workflow at specific time intervals                  |
| [Event Triggers](https://api.slack.com/future/triggers/event)         | Invoke a Workflow when a specific event happens in Slack      |
| [Webhook Triggers](https://api.slack.com/future/triggers/webhook)     | Invoke a Workflow when a specific URL receives a POST request |

---

### Manage access {#manage-access}

A newly created Trigger will only be accessible to others inside a workspace once its creator has granted access.

To manage what user (or many users) have access to run your Triggers, you'll use the `slack trigger access` command.

To learn more about this, visit the guide [here](https://api.slack.com/future/triggers#manage-access).

---

### Conclusion {#conclusion}

And that's the end of our triumphant trek learning about Triggers!

If you want to see Triggers in action with their pals, the Function and the Workflow, check out our sample [Hello World](https://github.com/slack-samples/bolt-js-starter-template/tree/future) app. For a more complex example, you can take a look at our [Request Time Off](https://github.com/slack-samples/bolt-js-request-time-off) app and its end-to-end [tutorial](/bolt-js/future/request-time-off-tutorial).
