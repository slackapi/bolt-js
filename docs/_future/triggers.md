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

Since Triggers are what trigger your Workflows, you need to have a Workflow before you can create a Trigger. Acquaint yourself with the [documentation on Workflows](/bolt-js/future/workflows), then head back here. We'll wait!

With the knowledge of Workflows within your noggin, let's take a look at the different types of Triggers, and how you can implement them into your new app. 

You will come to many forks in this metaphorical road that is Trigger implementation. There are no wrong choices; all roads lead to your own next-generation Slack app. 
</div>


---

### Create a Trigger {#create}

Creating a Trigger with the CLI is done in two steps:

**1. Create a Trigger File**

Triggers created with the CLI are designed using Trigger Files. The Trigger File you create will supply the information about how you want your Trigger to work.

The specifics of the Trigger File will depend on what [type of Trigger](#types) you want to use.

**2. Run the** `trigger create` **command**

Use the `trigger create` command to create your desired Trigger by pointing to a Trigger File. 

```bash
slack trigger create --trigger-def "path/to/trigger.json"
```

<div class="callout_card callout_info">
  <i class="ts_icon c-icon c-icon--info-circle"></i>
  <div>

**Slack CLI built-in documentation**<br>
Use `slack trigger --help`  to easily access information on the `trigger` command's flags and subcommands.

  </div>
</div>

#### Development and production Triggers

The Triggers you create when you're running your app locally in a development environment (with the `slack run` command) will not work when you deploy your app in production (with `slack deploy`). You'll need to `create` any Triggers again with the CLI. 

---

### Update a Trigger {#update}

#### Update a Trigger with the CLI {#update_cli}

Make an update to a pre-existing Trigger with the CLI by using the `slack trigger update` command. Provide the same payload you used to create the trigger *in its entirety*, in addition to the Trigger ID.

```bash
slack trigger update --trigger-id Ft123ABC --trigger-def "path/to/trigger.json"
```

## Delete a Trigger {#delete}

### Delete a Trigger with the CLI {#delete_cli}

You can delete a Trigger with the `slack trigger delete` command.

```bash
slack trigger delete --trigger-id FtABC123
```
---

## Trigger types {#types}

There are four types of Triggers, each one having its own specific implementation. 

| Trigger Type                     | Use case                                                      |
|----------------------------------|---------------------------------------------------------------|
| [Link Triggers](#link)           | Invoke a Workflow from anywhere in Slack                      |
| [Scheduled Triggers](#scheduled) | Invoke a Workflow at specific time intervals                  |
| [Event Triggers](#event)         | Invoke a Workflow when a specific event happens in Slack      |
| [Webhook Triggers](#webhook)     | Invoke a Workflow when a specific URL receives a POST request |

### Link Trigger {#link}
> Invoke a Workflow from anywhere in Slack

Link Triggers are actually somewhat a unique case of Trigger. They're an *interactive* type of Trigger. In other words, they require a user to manually trigger them, such as when they click a button.

#### Parameters 

| Field                  | Description                                 | Required |
|------------------------|---------------------------------------------|----------|
| `type`                 | The type of Trigger                         | 🔴       |
| `name`                 | The name of the Trigger                     | 🔴       |
| `workflow`             | Path to Workflow that the Trigger initiates | 🔴       |
| `description`          | The description of the Trigger              |          |
| `inputs`               | The inputs provided to the Workflow         |          |
| `shortcut`             | Contains `button_text`, if desired          |          |
| `shortcut.button_text` | The text of the shortcut button             |          |


#### Example JSON payload

The following is a JSON payload for creating a Link Trigger with an input from a Workflow:

```json
{
  "type": "shortcut",
  "name": "Reverse a String",
  "description": "Starts the workflow to test reversing a string",
  "workflow": "#/workflows/test_reverse",
  "shortcut": {},
  "inputs": {
    "interactivity": {
      "value": "{{data.interactivity}}"
    },
    "channel": {
      "value": "{{data.channel_id}}"
    }
  }
}
```

#### Create a Link Trigger with the CLI {#create-link-cli}

Create a JSON Trigger File containing the JSON payload.

Once you have created a Trigger File, use the following command to create the Link Trigger:

```bash
slack trigger create --trigger-def "path/to/trigger.json"
```

### Scheduled Trigger {#scheduled}
> Invoke a Workflow at specific time intervals

Scheduled Triggers are an *automatic* type of Trigger. This means that once the Trigger is created, they do not require any user input. 

Need a Workflow to happen on a daily, weekly, or annual cadence? A Scheduled Trigger is your best bet.

#### Parameters

| Field         | Description                                             | Required |
|---------------|---------------------------------------------------------|----------|
| `type`        | The type of Trigger                                     | 🔴       |
| `name`        | The name of the Trigger                                 | 🔴       |
| `workflow`    | Path to Workflow that the Trigger initiates             | 🔴       |
| `description` | The description of the Trigger                          |          |
| `inputs`      | The inputs provided to the Workflow                     |          |
| `schedule`    | When and how often the trigger will activate. See below | 🔴       |


**The** `Schedule` **Object**

| Field              | Description                                                     | Required |
|--------------------|-----------------------------------------------------------------|----------|
| `start_time`       | A date string of the first scheduled trigger                    | 🔴       |
| `timezone`         | timestone string to use for scheduling                          |          |
| `frequency`        | details on what cadence Trigger will activate. See below        |          |
| `occurrence_count` | The maximum number of times Trigger will run                    |          |
| `end_time`         | if set, this Trigger will not run past the provided date string |          |

**The** `Frequency` **Object** 

| Field           | Description                                                                          | Daily | Weekly | Monthly | Yearly |
|-----------------|--------------------------------------------------------------------------------------|-------|--------|---------|--------|
| `type`          | How often the Trigger will activate. Can be `daily`, `weekly`, `monthly` or `yearly` | 🔴    | 🔴     | 🔴      | 🔴     |
| `on_days`       | The days of the week the Trigger should activate on                                  |       | 🔴     |         |        |
| `repeats_every` | How often the Trigger will repeat, respective to `frequency.type`                    | 🔴    | 🔴     | 🔴      | 🔴     |
| `on_week_num`   | The nth week of the month the Trigger will repeat                                    |       |        | 🔴      |        |

#### Example JSON payload
The following is a JSON Trigger File creating a Scheduled Trigger that activates daily, starting on June 24, for four days:

```json
{
  "type": "scheduled",
  "name": "sends 'how cool is that' to my fav channel, every day",
  "description": "runs the send workflow",
  "workflow": "#/workflows/myWorkflow",
  "schedule": {
    "start_time": "2022-06-24T19:36:16Z",
    "frequency": {
        "type": "daily"
    },
    "occurrence_count": 4
  },
  "inputs": {
    "stringToReverse": {
      "value": "how cool is that"
    },
    "channel": {
      "value": "C123ABC456"
    }
  }
}
```

#### Create a Scheduled Trigger with the CLI {#create-scheduled-cli}

Create a JSON Trigger File containing the JSON payload.

Once you have created a Trigger File, use the following command to create the Scheduled Trigger:

```bash
slack trigger create --trigger-def "path/to/trigger.json"
``` 

### Event Trigger {#event}
>Invoke a Workflow when a specific event happens in Slack

Event Triggers are another type of *automatic* Trigger, in that they don't require manual activation. They won't be triggered on their own, however. Instead, they're automatically triggered when a certain event happens. 

These are the events that are currently supported for using with Event Triggers:

| Supported Event                                                            | Description                                                       |
|----------------------------------------------------------------------------|-------------------------------------------------------------------|
| [`app_mention`](/events/app_mention)                                       | Subscribe to only the message events that mention your app or bot |
| [`channel_archive`](/events/channel_archive)                               | A channel was archived                                            |
| [`channel_created`](/events/channel_created)                               | A channel was created                                             |
| [`channel_deleted`](/events/channel_deleted)                               | A channel was deleted                                             |
| [`channel_rename`](/events/channel_rename)                                 | A channel was renamed                                             |
| [`channel_shared`](/events/channel_shared)                                 | A channel has been shared with an external workspace              |
| [`channel_unarchive`](/events/channel_unarchive)                           | A channel was unarchived                                          |
| [`channel_unshared`](/events/channel_unshared)                             | A channel has been unshared with an external workspace            |
| [`dnd_updated`](/events/dnd_updated)                                       | Do not Disturb settings changed for a member                      |
| [`emoji_changed`](/events/emoji_changed)                                   | A custom emoji has been added or changed                          |
| [`member_joined_channel`](/events/member_joined_channel)                   | A user joined a public or private channel                         |
| [`member_left_channel`](/events/member_left_channel)                       | A user left a public or private channel                           |
| [`message`](/events/message)                                               | A message was sent to a channel                                   |
| [`message_metadata_posted`](/events/message_metadata_posted)               | Message metadata was posted                                       |
| [`pin_added`](/events/pin_added)                                           | A pin was added to a channel                                      |
| [`pin_removed`](/events/pin_removed)                                       | A pin was removed from a channel                                  |
| [`reaction_added`](/events/reaction_added)                                 | A member has added an emoji reaction to an item                   |
| [`reaction_removed`](/events/reaction_removed)                             | A member removed an emoji reaction                                |
| [`shared_channel_invite_accepted`](/events/shared_channel_invite_accepted) | A shared channel invite was accepted                              |
| [`shared_channel_invite_approved`](/events/shared_channel_invite_approved) | A shared channel invite was approved                              |
| [`shared_channel_invite_declined`](/events/shared_channel_invite_declined) | A shared channel invite was declined                              |
| [`shared_channel_invite_received`](/events/shared_channel_invite_received) | A shared channel invite was sent to a Slack user                  |
| [`team_join`](/events/team_join)                                           | A new member has joined                                           |

We'll continue to add more triggerable events in the future. Stay tuned!

#### Parameters

| Field         | Description                                 | Required |
|---------------|---------------------------------------------|----------|
| `type`        | The type of Trigger                         | 🔴       |
| `name`        | The name of the Trigger                     | 🔴       |
| `workflow`    | Path to Workflow that the Trigger initiates | 🔴       |
| `description` | The description of the Trigger              |          |
| `inputs`      | The inputs provided to the Workflow         |          |
| `event`       | Contains the Event Object. See below        |          |



**The** `Event` **object**

| Field         | Description                                 | Required |
|---------------|---------------------------------------------|----------|
| `event_type`  | The type of event                           | 🔴       |
| `channel_ids` | An aray of event-related channel ID strings |          |
| `filter`      | See [Trigger Filters](#filters)             |          |
| `team_ids`    | An array of event-related team ID strings   |          |

#### Example JSON payload

The following is a JSON Trigger File creating an Event Trigger that listens for a `reaction_added` event in a specific channel:

```json
{
  "type": "event",
  "name": "Reactji response",
  "description": "responds to a specific reactji",
  "workflow": "#/workflows/myWorkflow",
  "event": {
    "event_type": "slack#/events/reaction_added",
    "channel_ids": ["C123ABC456"],
    "filter": {
      "version": 1, 
      "root": {
        "statement": "{{data.reaction}} == sunglasses"
      }
    }
  },
  "inputs": {
    "stringtoSend": {
      "value": "how cool is that"
    },
    "channel": {
      "value": "C123ABC456"
    }
  }
}
```

#### Create an Event Trigger with the CLI {#create-event-cli}

Create a JSON Trigger File containing the JSON payload.

Once you have created a Trigger File, use the following command to create the Event Trigger:

```bash
slack trigger create --trigger-def "path/to/trigger.json"
``` 

### Webhook Trigger {#webhook}
> Invoke a Workflow when a specific URL receives a POST request

Webhook Triggers are an *automatic* type of Trigger that listens for a certain type of data, much like Event Triggers.

While Event Triggers are used for activating a Trigger based on *internal* activity, webhooks are instead used when activating a Trigger based on *external* activity. In other words, Webhook Triggers are useful when tying Slack functionality together with non-Slack services.
#### Parameters

| Field            | Description                                 | Required |
|------------------|---------------------------------------------|----------|
| `type`           | The type of Trigger                         | 🔴       |
| `name`           | The name of the Trigger                     | 🔴       |
| `workflow`       | Path to Workflow that the Trigger initiates | 🔴       |
| `description`    | The description of the Trigger              |          |
| `inputs`         | The inputs provided to the Workflow         |          |
| `webhook`        | Contains `filter`, if desired               |          |
| `webhook.filter` | See [Trigger Filters](#filters)             |          |

#### Example JSON payload

The following is a JSON Trigger File creating a Webhook Trigger:

```json
{
  "type": "webhook",
  "name": "sends 'how cool is that' to my fav channel",
  "description": "runs the example workflow",
  "workflow": "#/workflows/myWorkfow",
  "webhook": {
    "channel_ids": ["C123ABC456"]
  },
  "inputs": {
    "stringtoSend": {
      "value": "how cool is that"
    },
    "channel": {
      "value": "C123ABC456"
    }
  }
}
```

#### Create a Webhook Trigger with the CLI {#create-webhook-cli}

Create a JSON Trigger File containing the JSON payload.

Once you have created a Trigger File, use the following command to create the Webhook Trigger:

```bash
slack trigger create --trigger-def "path/to/trigger.json"
``` 

### Trigger Filters {#filters}

Trigger Filters allow you to define a set of conditions for a Trigger which must be true in order for the Trigger to trip. For example, you might want to have a `reaction_added` Trigger that only triggers if the reaction was a `:eyes:` reaction, and not on any other reaction. 

Trigger Filters are implemented by inserting a filter payload within your `trigger` object. The payload takes the form of a JSON object containing blocks of conditional logic. 

The logical condition within each block can be one of two types:

* Conditional expressions (e.g. `x < y`)
* Boolean logic (e.g. `x AND y`)

Conditional expression blocks need a single `statement` key with a string containing the comparison block. Values from the `inputs` payload can be referenced within the comparison block: 

```json
        "filter": {
            "version": 1,
            "root": 
            {
                "statement": "{{data.reaction}} == 'eyes'"
            }
        }
```

Boolean logic blocks are made up of two key:value pairs: 

* An `operator` key with a string containing the comparison operator
* An `inputs` key with the child blocks

The child blocks then contain additional logic. In this case, it's two conditional expression blocks: 

```json
"filter": {
    "version": 1,
    "root": {
       "operator": "OR",
       "inputs": [
        {
            "statement": "{{data.reaction}} == 'eyes'"
        },
        {
            "statement": "{{data.metadata.event_payload.incident_type}} == 'security'"
        }
       ]
    }
}
```

<div class="callout_card callout_positive">
  <i class="ts_icon c-icon c-icon--star-o"></i>
  <div>

**Nested logic blocks**<br>
You can use the same boolean logic to create nested boolean logic blocks. It's boolean logic all the way down - up to a maximum of 5 nested blocks, that is. 

  </div>
</div>

With your desired filter designed, set it within the `trigger` object when you `create` or `update` a Trigger. 

```json
{
    "trigger_id": "Ft123ABC456",
    "trigger": {
        "type": "event",
        "event_type": "slack#/events/reaction_added",
        "function_reference": "#/workflows/my_workflow",
        "function_app_id": "A123ABC456",
        "inputs": {
            "reaction": {
                "value": "{{data.reaction}}"
            }
        },
        "channel_ids": ["C123ABC456"],
        
        "filter": {
            "version": 1,
            "root": {
              "operator": "OR",
              "inputs": [
                {
                    "statement": "{{data.reaction}} == 'eyes'"
                },
                {
                    "statement": "{{data.metadata.event_payload.incident_type}} == 'security'"
                }
              ]
                
            }
        }
    }
}
```
---

### Manage Access {#manage-access}

A newly created [Trigger](/bolt-js/future/triggers) will only be accessible to others inside a workspace once its creator has granted access.

To manage what user (or many users) have access to run your Triggers, you'll use the `access` command.

To learn more about this, visit the guide [here](https://api.slack.com/future/triggers#manage-access).

---

### Conclusion {#conclusion}

And that's the end of our triumphant trek learning about Triggers!

If you want to see Triggers in action with their pals, the Function and the Workflow, check out our sample [Time Off Request](https://github.com/slack-samples/bolt-js-take-your-time) app within our GitHub repository.
