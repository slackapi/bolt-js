---
title: Migrating Hubot apps
order: 3
slug: hubot-migration
lang: en
layout: tutorial
permalink: /tutorial/hubot-migration
redirect_from:
  - /hubot-migration
---
# Migrating apps from Hubot to Bolt for JavaScript

<div class="section-content">
Bolt was created to reduce the time and complexity it takes to build Slack apps. It provides Slack developers a single interface to build using modern features and best practices. This guide is meant to step you through the process of migrating your app from using [Hubot](https://hubot.github.com/docs/) to Bolt for JavaScript.

If you already have an [app with a bot user](https://api.slack.com/bot-users#getting-started) or if you’re looking for code samples that translate Hubot code to Bolt for JavaScript code, you may find it valuable to start by reading through the [example script in the Bolt for JavaScript repository](https://github.com/slackapi/bolt-js/blob/master/examples/hubot-example/script.js).
</div> 

---

### Setting the stage
When translating a Hubot app to Bolt for JavaScript, it’s good to know how each are working behind the scenes. Slack’s Hubot adapter is built to interface with the [RTM API](https://api.slack.com/rtm), which uses a WebSocket-based connection that sends a stream of workspace events to your Hubot app. The RTM API is not recommended for most use cases since it doesn’t include support for newer platform features and it can become very resource-intensive, particularly if the app is installed on multiple or large Slack teams.

The default Bolt for JavaScript receiver is built to support the [Events API](https://api.slack.com/events-api), which uses HTTP-based event subscriptions to send JSON payloads to your Bolt app. The Events API includes newer events that aren’t on RTM and is more granular and scalable. It’s recommended for most use cases, though one reason your app may be stuck using the RTM API could be that the server you’re hosting your app from has a firewall that only allows outgoing requests and not incoming ones.

There are a few other differences you may want to consider before creating a Bolt for JavaScript app:
- The minimum version of Node for Bolt for JavaScript is `v10.0.0`. If the server you’re hosting your app from cannot support `v10`, it’s not possible to migrate your app to Bolt for JavaScript at the moment.
- Bolt for JavaScript doesn’t have support for external scripts. If your Hubot app uses external scripts that are necessary to your app’s functionality or deployment, you probably want to stay with Hubot for now. If you aren’t sure whether your app has any external scripts, you can check the `external-scripts.json` file. As we continue to invest in Bolt for JavaScript, we are thinking about the future and how to make development and deployment of Slack apps easier. If there’s a valuable external script that your app uses, we’d love to hear what it is [in the dedicated Github issue](https://github.com/slackapi/bolt-js/issues/119).
- Hubot apps are written in Coffeescript, which transpiles into Javascript. We decided to write Bolt in Typescript to give access to rich type information. Bolt apps can be developed using Typescript or Javascript. The [example script](https://github.com/slackapi/bolt-js/blob/master/examples/hubot-example/script.js) shows you how your Coffeescript may translate to Javascript. If your app is more than a few simple scripts, it may be worth looking into projects like [Decaffeinate](https://github.com/decaffeinate/decaffeinate) to convert your CoffeeScript to Javascript.

---

### Configuring your bot
If you have access to an existing Slack app with a bot user, you can [jump ahead to the next section](#configure-what-your-bot-will-hear). If you aren’t sure, go to your [App Management page](https://api.slack.com/apps) and check whether your Hubot app is there. If it is, you can use the credentials from that app ([go ahead and skip to the next section](#configure-what-your-bot-will-hear)). Otherwise, we’ll walk you through creating a Slack app.

#### Create a Slack app

The first thing you’ll want to do is [create a Slack app](https://api.slack.com/apps/new).

> 💡We recommend using a workspace where you won’t disrupt real work getting done — you can create a new one for free.

After you fill out your app’s name and pick a workspace to install it to, hit the `Create App` button and you’ll land on your app’s **Basic Information** page.
 
This page contains an overview of your app in addition to important credentials you’ll need later, like the `Signing Secret` under the **App Credentials** header.

Look around, add an app icon and description, and then let’s start configuring your app 🔩

#### Add a bot user
On Slack, Hubot apps employ bot users which are designed to interact with users in conversation.

To add a bot user to your new app, click **Bot Users** on the left sidebar and then **Add A Bot User**. Give it a display name and username, then click **Add Bot User**. There’s more information about what the different fields are [on our API site](https://api.slack.com/bot-users#creating-bot-user).

### Configure what your bot will hear
The [Events API](https://api.slack.com/bot-users#app-mentions-response) is a bot's equivalent of eyes and ears. It gives a bot a way to react to posted messages, changes to channels, and other activities that happen in Slack.

> ⚠️Before you configure your bot’s events, you’ll need a public URL. If you’ve never created a Bolt for JavaScript app or never used the Events API, it’d be helpful to go through [setting up your local Bolt project](https://slack.dev/bolt/tutorial/getting-started#setting-up-your-local-project) and [setting up events](https://slack.dev/bolt/tutorial/getting-started#setting-up-events) in the Getting Started guide.

#### Listening for messages
All Hubot apps can listen to messages by default, so we need to configure your bot user to do the same.

After walking through [setting up events](https://slack.dev/bolt/tutorial/getting-started#setting-up-events), your Request URL should be verified. Scroll down to **Subscribe to Bot Events**. There are four events related to messages: `message.channels` (listens for messages in public channels), `message.groups` (listens for messages in private channels), `message.im` (listens for messages in the App Home/DM space), and `message.mpim` (listens for messages in multi-person DMs).

If you only want your bot to listen to messages in channels, you can listen to `message.channels` and `message.groups`. Or if you want your bot to listen to messages from everywhere it is, choose all four message events.

After you’ve added the kinds of message events you want your bot to listen to, click **Save Changes**.

#### Listening for other events
Your Hubot app may have responded to other events depending on what functionality you used. Look through your script and identify any places where your script uses `react`, `respond`, or `presenceChange`:
- If your app uses `respond`, subscribe to the `app_mention` event. This listens for any time your bot user is mentioned.
- If your app uses `react`, subscribe to the `reaction_added` event. This listens for any time a reaction is added to a message in channels your bot user is in.
- If your app uses `presenceChange`, there is no corresponding event. If this event is important to your bot’s functionality, you may have to continue using Hubot or modify the app’s logic.

> 💡An added benefit to Bolt is you can listen to any [Events API event](https://api.slack.com/events). So after you’re done migrating, you can listen to more events like [when a user joins the workspace](https://api.slack.com/events/team_join) or [when a user opens a DM with your app](https://api.slack.com/events/app_home_opened).

After you added events that correspond to your app’s functionality, click **Save Changes**.

### Changes to script interfaces
Bolt’s interface was designed to conform to the Slack API language as much as possible, while Hubot was designed with more generalized language to abstract multiple services. While the interfaces are similar, converting a Hubot script to a Bolt for JavaScript one still requires some code changes.

Bolt for JavaScript doesn’t use `res` or expose the raw request from Slack. Instead, you can use the payload body from `payload`, or common functionality like sending a message using `say()`. 

> ⚙️To make it easier, we’ve created a sample script on Github that [showcases Hubot’s core functionality using equivalent functionality written with Bolt for JavaScript](https://github.com/slackapi/bolt-js/blob/master/examples/hubot-example/script.js).

#### Listening to patterns using `message()`
Hubot scripts use `hear()` listen to messages with a matching pattern. Bolt for JavaScript instead uses `message()` and accepts a `string` or `RegExp` for the pattern.

> 👨‍💻👩‍💻Anywhere where you use `hear()` in your code, change it to use `message()`

[Read more about listening to messages](https://slack.dev/bolt/concepts#message-listening).

#### Responding with a message using `say()` and `respond()`
Hubot scripts use `send()` to send a message to the same conversation and `reply()` to send a message to the same conversation with an @-mention to the user that sent the original message.

Bolt for JavaScript uses `await say()` in place of `send()`, or `await respond()` to use the `response_url` to send a reply. To add an @-mention to the beginning of your reply, you can use the user ID found in the `context` object. For example, for a message event you could use `await say('<@${message.user}> Hello :wave:')`

The arguments for Hubot’s `send()` and Bolt for JavaScript's `say()` are mostly the same, although `say()` allows you to send messages with [interactive components like buttons, select menus, and datepickers](https://api.slack.com/messaging/interactivity#interaction).

> 👨‍💻👩‍💻Anywhere where you use `send()` in your code, change it to use `await say()`

[Read more about responding to messages](https://slack.dev/bolt/concepts#message-sending).

#### `respond` and `react`

In the previous section, you should have subscribed your app to the `app_mention` event if your Hubot script uses `respond()`, and `reaction_added` if you uses `react()`.

Bolt for JavaScript uses a method called `event()` that allows you to listen to any [Events API event](https://api.slack.com/events). To change your code, you’ll just change any `respond()` to `app.event(‘app_mention’)` and any `react()` to `app.event(‘reaction_added’)`. This is detailed more [in the example script](https://github.com/slackapi/bolt-js/blob/master/examples/hubot-example/script.js).

> 👨‍💻👩‍💻Anywhere where you use `respond()` in your code, change it to use `app.event(‘app_mention’)`. Anywhere you use `react`, change it to `app.event(‘reaction_added’)`.

[Read more about listening to events](https://slack.dev/bolt/concepts#event-listening).

### Using Web API methods with Bolt for JavaScript
In Hubot, you needed to import the `WebClient` package from `@slack/client`. Bolt for JavaScript imports a `WebClient` instance for you by default, and exposes it as the `client` argument available on all listeners.

To use the built-in `WebClient`, you’ll need to pass the token used to instantiate your app or the token associated with the team your request is coming from. This is found on the `context` object passed in to your listener functions. For example, to add a reaction to a message, you’d use:

```javascript
app.message('react', async ({ message, context, client }) => {
  try {
    const result = await client.reactions.add({
      token: context.botToken,
      name: 'star',
      channel: message.channel,
      timestamp: message.ts,
    });
  }
  catch (error) {
    console.error(error);
  }
});
```

> 👨‍💻👩‍💻Change your Web API calls to use one the `client` argument.

[Read more about using the Web API with Bolt](https://slack.dev/bolt/concepts#web-api).

### Using middleware with Bolt for JavaScript
Hubot has three kinds of middleware: receive (runs before any listeners are called), listener (runs for every matching listener), and response (runs for every response sent).

Bolt for JavaScript only has two kinds of middleware — global and listener:
- Global middleware runs before any listener middleware is called. It’s attached to the Bolt for JavaScript app itself. [Read more about Bolt for JavaScript's global middleware](https://slack.dev/bolt/concepts#global-middleware).
- Listener middleware only runs for listener functions it’s attached to. [Read more about Bolt for JavaScript's listener middleware](https://slack.dev/bolt/concepts#listener-middleware).

In Bolt for JavaScript, both kinds of middleware must call `await next()` to pass control of execution from one middleware to the next. If your middleware encounters an error during execution, you can `throw` it and the error will be bubbled up through the previously-executed middleware chain.

To migrate your existing middleware functions, it’s evident that Hubot’s receive middleware aligns with the use case for global middleware in Bolt for JavaScript. And Hubot and Bolt’s listener middleware are nearly the same. To migrate Hubot’s response middleware, wrap Bolt for JavaScript's `say()` or `respond()` in your own function, and then call it.

If your middleware needs to perform post-processing of an event, you can call `await next()` and any code after will be processed after the downstream middleware has been called.

### Migrating the brain to the conversation store
Hubot has an in-memory store called the brain. This enables a Hubot script to `get` and `set` basic pieces of data. Bolt for JavaScript uses a conversation store, which is a global middleware with a `get()`/`set()` interface.

The default, built-in conversation store uses an in-memory store similar to Hubot, with the ability to set an expiration time in milliseconds. There are two ways to get and set conversation state:
- Call `app.convoStore.get()` with a conversation ID to retrieve the state of a conversation, and call `app.convoStore.set()` with a conversation ID, conversation state (key-value pair), and an optional `expiresAt` time in milliseconds.
- In listener middleware, call `context.updateConversation()` with the updated conversation state, or use `context.conversation` to access the current state of the conversation.

If there is more than one instance of your app running, the built-in conversation store will not be shared among the processes so you’ll want to implement a conversation store that fetches conversation state from a database.

[Read more about conversation stores](https://slack.dev/bolt/concepts#conversation-store).

### Next steps
If you’ve made it this far, it means you’ve likely converted your Hubot app into a Bolt for JavaScript app! ✨⚡

Now that you have your flashy new Bolt for JavaScript app, you can explore how to power it up:
- Consider adding interactivity [like buttons and select menus](https://api.slack.com/messaging/interactivity#interaction). These weren’t supported by Hubot and will allow your app to include contextual actions when sending messages to Slack.
- Read [the documentation](https://slack.dev/bolt/concepts) to explore what else is possible with Bolt for JavaScript.
- Check out our [sample app](https://glitch.com/~slack-bolt) that shows you how to use events and interactive components.

And if you have difficulties while developing, reach out to our developer support team to at [developers@slack.com](mailto:developers@slack.com), and if you run into a problem with the framework [open an issue on Github](https://github.com/slackapi/bolt-js/issues/new).
