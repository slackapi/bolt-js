---
title: Custom functions
order: 5
slug: custom-functions
lang: en
layout: tutorial
permalink: /future/custom-functions
---
# Custom functions <span class="label-beta">BETA</span>

<div class="section-content">
On the next-generation platform, you can build **custom functions**, reusable building blocks of automation that are deployed to our infrastructure and accept inputs, perform some calculations, and provide outputs. Functions can be used as steps in [Workflows](/bolt-js/future/workflows)&mdash;and Workflows are invoked by [Triggers](/bolt-js/future/triggers).

To create a function, we need to do three things: 
- [define the function](#define) in the Manifest;
- [implement the function](#implement) in its respective source file;
- [distribute the function](#distribute) so others can use it.
</div>

---

### Defining a function {#define}
Functions are defined in your app via the `DefineFunction` method, which is part of the SDK that gets included with every newly created project.

Let's take a look at an empty function:
```js
const NothingFunction = DefineFunction({
  callback_id: "nothing_function",
  title: "Do Nothing",
  source_file: "functions/nothing.ts"
});
```



---

### Implementing a function {#implement}

Implement functions in just a few steps:

#### 1. Create the source file in `manifest/function`
Create a file for your function to live in and name it something that makes sense for your function. For example, if I'm writing a function that sends one of our engineers Brad a singing telegram, I might name the file `send-brad-some-singers.js`.

#### 2. Write code in the source file to define your function
The exported module of your function's source file should be the function handler. It can be either asynchronous (for example, if you're calling API methods) or sychronous.

The function takes a single argument called its "context", and returns an object that exactly matches the structure of function definition's `output_parameters`.

Let's look at a sample function file, `sample-function.js`, from the `manifest/function` directory in our default [Bolt JS Starter Template](https://github.com/slack-samples/bolt-js-starter-template/tree/future). This function, `SampleFunctionDefinition`, defines its expected input parameters:
```js
const { DefineFunction, Schema } = require('@slack/bolt');

const SampleFunctionDefinition = DefineFunction({
  callback_id: 'sample_function_id',
  title: 'Send a greeting',
  description: 'Send greeting to channel',
  source_file: 'functions/sample-function.js',
  input_parameters: {
    properties: {
      recipient: {
        type: Schema.slack.types.user_id,
        description: 'Send greeting to this recipient',
      },
      channel: {
        type: Schema.slack.types.channel_id,
        description: 'Channel to send message to',
      },
      message: {
        type: Schema.types.string,
        description: 'Message to the recipient',
      },
    },
    required: ['message'],
  },
});

module.exports = { SampleFunctionDefinition };
```

When using a [local development server](/future/run), you can use `console.log` to emit information to the console. When your app is [deployed to production](/future/deploy), any `console.log` commands are available via `slack activity`. Check out our [Logging](/future/logging) page for more.

When composing your functions, some things you can do include:

* leverage external APIs, and even store API credentials inside `env` using the CLI's [`slack env add` command](/future/tools/cli#var-add)
* [call Slack API methods](/future/apicalls) or [third-party APIs](/future/apicalls/third-party)

You can also encapsulate your business logic separately from the function handler, then import what you need and build your functions that way.

#### 3. Add function listener and handler(s)
Once your function has been defined, you'll need to register a function listener to trigger the function's functionality as well as any other related events.

To do this, create a file in `listeners/functions`. This file will use the defined function and also implement any needed additional logic - in this case, it'll send a message to greet someone based on what is being passed in from the greeting function in step 2. 

```js
// For more information about functions: https://api.slack.com/future/functions
const { SlackFunction } = require('@slack/bolt');

// Get our Function Definition from the manifest!
const { SampleFunctionDefinition } = require('../../manifest/function/sample-function');

// Here is the work we want to do!
const helloWorld = async ({ event, client, complete }) => {
  const { recipient, channel, message } = event.inputs;
  const salutations = ['Hello', 'Hi', 'Howdy', 'Hola', 'Salut'];
  const salutation = salutations[Math.floor(Math.random() * salutations.length)];
  try {
    await client.chat.postMessage({
      channel,
      text: `${salutation}, <@${recipient}>! :wave: Someone sent the following greeting: \n\n>${message}`,
    });
    complete();
  } catch (err) {
    // Complete function with an error
    await complete({ error: `There was an issue: ${err}` });
    throw (err);
  }
};

// Let's create a new Slack Function with helloWorld as its handler
const helloWorldFunc = new SlackFunction(SampleFunctionDefinition.id, helloWorld);

module.exports = { helloWorldFunc };
```

Once this file has been created, the function handler can be registered in an `index.js` file within the `listeners/functions` directory:
```js
const { helloWorldFunc } = require('./hello-world');

// Register a complete function
module.exports.register = (app) => {
  app.function(helloWorldFunc);
  // Register another function here
};
```

In order to make sure this handler is triggered, make sure the Function listeners are registered in your `listeners/index.js` file:
```js
const functions = require('./functions');

module.exports.registerListeners = (app) => {
  functions.register(app);
};
```
#### 4. Add function to app through workflow or manifest
To actually call the defined function, `SampleFunctionDefinition`, don't forget to add your function to a workflow! When you're finished defining and implementing your functions, the next step is to add them to [Workflows](/bolt-js/future/workflows). Once added as a step in a Workflow, your Function will run when that Workflow is invoked by a [Trigger](/bolt-js/future/triggers).
