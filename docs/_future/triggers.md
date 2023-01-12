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

1. Functions define the actions of your app
2. Workflows group functions into ordered steps
3. Triggers invoke workflows (⬅️ you are here)

Since triggers kick off workflows, you need to have a workflow before you can create a trigger. Acquaint yourself with the [documentation on workflows](/bolt-js/future/workflows), then head back here. We'll wait!

Once you've created a workflow, you can dive into the guide below! 
</div>


---

### Create a trigger {#create}

Triggers can be added to workflows in two ways:

* [**You can add triggers with the CLI.**](#create_cli) These static triggers are created only once. You create them with the Slack CLI, attach them to your app's workflow, and that's that. 

* [**You can add triggers at runtime.**](#create_runtime) These dynamic triggers are created at any step of a workflow so they can incorporate data acquired from other workflow steps.

#### Create a trigger with the CLI {#create_cli}

**1. Create a trigger file**

Triggers created with the CLI are designed using trigger files. The trigger file you create will supply the information about how you want your trigger to work. **For Bolt for JavaScript apps, you will need to create JSON trigger files.**

The specifics of the trigger file's structure will depend on what [type of trigger](#types) you want to use.

The Hello World app from the Bolt for JavaScript starter template uses a link trigger, which is one of several [trigger types](#types). You can view its trigger file [here](https://github.com/slack-samples/bolt-js-starter-template/blob/future/triggers/hello-world-trigger.json).

**2. Run the** `trigger create` **command**

Use the `trigger create` command to create your desired trigger by pointing to a trigger file. 

```bash
slack trigger create --trigger-def "path/to/trigger.json"
```

> 💡 In order to run the trigger and launch the full workflow, your application must be running via `slack run`.

<p class="alert alert_info"><ts-icon class="ts_icon_info_circle"></ts-icon>**Slack CLI built-in documentation**<br>
Use `slack trigger --help`  to easily access information on the `trigger` command's flags and subcommands.</p>

#### Create a trigger at runtime {#create_runtime}

The logic of a runtime trigger lies within a function's code. The specific payload is dependent on the [type of trigger](#types) you use.

Within your `manifest/functions` folder, you'll have the functions that are the steps making up your workflow. Within this folder is where you can create a trigger within the relevant `<function>.js` file. 

The `create` method for runtime triggers takes the form of `client.workflows.triggers.create()`. Within that method you can leverage `inputs` acquired in previous steps (i.e. with functions) within the workflow.

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

The response will have a property called `ok`. If `true`, then the trigger was created, and the `trigger` property will be populated.

Your response will include a `trigger.id`; be sure to store it! You will use that to `update` or `delete` the trigger if need be.

#### Development and production triggers

The triggers you create when you're running your app locally in a development environment (with the `slack run` command) will not work when you [deploy your app](/bolt-js/future/deploy-your-app). You'll need to `create` any triggers again with the CLI.

---

### Update a trigger {#update}

Make an update to a preexisting trigger by using the `slack trigger update` command. Provide the same payload you used to create the trigger *in its entirety*, in addition to the trigger ID.

```bash
slack trigger update --trigger-id Ft123ABC --trigger-def "path/to/trigger.json"
```
---

### Delete a trigger {#delete}

You can delete a trigger with the `slack trigger delete` command.

```bash
slack trigger delete --trigger-id FtABC123
```
---

### Trigger types {#types}

There are four types of triggers, each one having its own specific implementation. To learn more about each trigger, visit the linked pages below.

| Trigger Type                     | Use case                                                      |
|----------------------------------|---------------------------------------------------------------|
| [Link triggers](https://api.slack.com/future/triggers/link)           | Invoke a workflow from anywhere in Slack                      |
| [Scheduled triggers](https://api.slack.com/future/triggers/scheduled) | Invoke a workflow at specific time intervals                  |
| [Event triggers](https://api.slack.com/future/triggers/event)         | Invoke a workflow when a specific event happens in Slack      |
| [Webhook triggers](https://api.slack.com/future/triggers/webhook)     | Invoke a workflow when a specific URL receives a POST request |

---

### Manage access {#manage-access}

A newly created trigger will only be accessible to others inside a workspace once its creator has granted access.

To manage what user (or many users) have access to run your triggers, you'll use the `slack trigger access` command.

To learn more about this, visit the guide [here](https://api.slack.com/future/triggers#manage-access).

---

### Conclusion {#conclusion}

And that's the end of our triumphant trek learning about triggers!

If you want to see triggers in action with their pals, the function and the workflow, check out our sample [Hello World](https://github.com/slack-samples/bolt-js-starter-template/tree/future) app. For a more complex example, you can take a look at our [Request Time Off](https://github.com/slack-samples/bolt-js-request-time-off) app and its end-to-end [tutorial](/bolt-js/future/request-time-off-tutorial).
