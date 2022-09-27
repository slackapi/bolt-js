---
title: Custom functions
order: 3
slug: custom-functions
lang: en
layout: tutorial
permalink: /future/custom-functions
---
# Custom functions <span class="label-beta">BETA</span>

<div class="section-content">
On the next-generation platform, you can build **custom functions**, reusable building blocks of automation that are deployed to our infrastructure and accept inputs, perform some calculations, and provide outputs. Functions can be used as steps in [Workflows](/bolt-js/future/workflows)&mdash;and Workflows are invoked by [Triggers](/bolt-js/future/triggers).

To create a function, we need to do the following: 
- [define the function](#define) in the Manifest;
- [implement the function](#implement) in its respective source file;
</div>

---

### Defining a function {#define}
Functions are defined in your app via the `DefineFunction` method, which is part of the SDK that gets included with every newly created project. These function definitions are stored under the `manifest/functions/` directory.

Let's go ahead and create a new function definition file under `manifest/functions` directory. Name it something related to what the function does. In our [Bolt for JavaScript Starter Template](https://github.com/slack-samples/bolt-js-starter-template/blob/future/manifest/function/sample-function.js), we name the file `sample-function.js`. Let's take a peek at it:
```js
const { DefineFunction, Schema } = require('@slack/bolt');

const SampleFunctionDefinition = DefineFunction({
  callback_id: 'sample_function_id',
  title: 'Send a greeting',
  description: 'Send greeting to channel',
  source_file: 'functions/sample-function.ts',
  input_parameters: {
    properties: {
      recipient: {
        type: Schema.slack.types.user_id,
        description: 'Send greeting to this recipient',
      },
      message: {
        type: Schema.types.string,
        description: 'Message to the recipient',
      },
    },
    required: ['message'],
  },
  output_parameters: {
    properties: {
      greeting: {
        type: Schema.types.string,
        description: 'Greeting for the recipient',
      },
    },
    required: ['greeting'],
  },
});

module.exports = { SampleFunctionDefinition };
```

Note that we import `DefineFunction`, which is used for defining our function, and also `Schema`, which has information on supported [Built-in types](https://api.slack.com/future/types).

Just like [Workflows](/bolt-js/future/workflows), Custom functions have a unique `callback_id` and also require a `title`. Additionally, you can set inputs and outputs just like you can with Workflows. 

Here's all the fields you can use when defining a Custom function:

| Field | Expected value |
| ---- | ------------------ |
| `callback_id` | A required unique string identifier representing the function ("nothing" in the above example). It must be unique in your application; no other functions may share the same callback ID. Changing a function's callback ID is not recommended as it means that the function will be removed from the app and created under the new callback ID, which will break any workflows referencing the old function. | 
| `title` | A required string to nicely identify the function. |
| `description` | An _optional_ succinct summary of what your function does. |
| `input_parameters` | An object which describes one or more input parameters that will be available to your function. Each top-level property of this object defines the name of one input parameter which will become available to your function. 
| `output_parameters` | An object which describes one or more output parameters that will be returned by your function. This object follows the exact same pattern as `input_parameters`: top-level properties of the object define output parameter names, with the property values further describe the type and description of each individual output parameter. |

The value for properties in `input_parameters` and `output_parameters` needs to be an object with further sub-properties:
  * `type`: The type of the input parameter. This can be a [Built-in type](https://api.slack.com/future/types) or a [Custom type](https://api.slack.com/future/types/custom) that you define.
  * `description`: A string description of the parameter.

If you want to set a property as required, list its name in its respective input or output properties as a `required` property.

For example, if you have an input parameter named `customer_id` that you want to be required, you can do so like this:

```javascript
input_parameters: {
  properties: {
    customer_id: {
      type: Schema.types.string,
      description: "The customer's ID"
    }
  },
  required: ["customer_id"]
}
```

Functions can (and generally should) declare inputs and outputs. 

Inputs are declared in the `input_parameters` property, and outputs are declared in the `output_parameters` property. Each can contain either [Built-in types](https://api.slack.com/future/types) or [Custom types](https://api.slack.com/future/types/custom) that you define.

While, strictly speaking, input and output parameters are optional, they are a common and standard way to pass data between functions and nearly any function you write will expect at least one input and pass along an output.

Functions are similar in philosophy to Unix system commands: they should be minimalist, modular, and reusable. Expect the output of one function to eventually become the input of another, with no other frame of reference.

Once your function is defined in its own file in `manifest/functions`, the next steps are to add a function listener, register the listener, and implement the function in a workflow.

---

### Implementing a Function Listener {#implement}

Implement functions in just a few steps:

#### 1. Create the function definition file in the `manifest/functions` directory
If you haven't done so already, create a file for your function definition to live in and name it something that makes sense for your function. In the [Bolt for JavaScript Starter Template](https://github.com/slack-samples/bolt-js-starter-template/blob/future/manifest/function/sample-function.js), we named this file `sample-function.js`


#### 2. Add function listener and handler(s)
Once your function has been defined, you'll need to register a function listener to trigger the function's functionality as well as any other related events.

To do this, create a file in `listeners/functions` directory for your function listener (in this case, the file will be called `hello-world.js`). This file will use the function definition you created earlier and also implement any needed additional logic&mdash;in this case, it'll send a message to greet someone based on what is being passed in as inputs. You can see the full completed `hello-world.js` function listener [here](https://github.com/slack-samples/bolt-js-starter-template/blob/future/listeners/functions/hello-world.js).

```js
// listeners/functions/hello-world.js
// For more information about functions: https://api.slack.com/future/functions
// For more information about functions: https://api.slack.com/future/functions
const { SlackFunction } = require('@slack/bolt');

// Get our Function Definition from the manifest!
const { SampleFunctionDefinition } = require('../../manifest/function/sample-function');

// Here is the work we want to do!
const helloWorld = async ({ event, complete }) => {
  const { recipient, message } = event.inputs;
  const salutations = ['Hello', 'Hi', 'Howdy', 'Hola', 'Salut'];
  const salutation = salutations[Math.floor(Math.random() * salutations.length)];
  try {
    const greeting = `${salutation}, <@${recipient}>! :wave: Someone sent the following greeting: \n\n>${message}`;
    complete({ outputs: { greeting } });
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
The `hello-world.js` file declares a function handler, `helloWorld`, that takes in inputs from the `event`, which is the payload received when your function is being executed. It executes logic within the handler to return a message with a random greeting. This message is the function's output. In addition to the function handler, a new `SlackFunction` instance is declared that actually links the `helloWorld` handler to `SampleFunctionDefinition` through the function's ID:
```js
// Let's create a new Slack Function with helloWorld as its handler
const helloWorldFunc = new SlackFunction(SampleFunctionDefinition.id, helloWorld);
```

Once this file has been created, the function handler can be registered in an `index.js` file within the `listeners/functions` directory:
```js
// listeners/functions/index.js
const { helloWorldFunc } = require('./hello-world');

// Register a complete function
module.exports.register = (app) => {
  app.function(helloWorldFunc);
  // Register another function here
};
```


Lastly, in order to make sure this handler is triggered, make sure the Function listeners are registered in your `listeners/index.js` file:
```js
// listeners/index.js
const functions = require('./functions');

module.exports.registerListeners = (app) => {
  functions.register(app);
};
```
#### 3. Add the function as a step in your workflow
To actually call the defined function, `SampleFunctionDefinition`, don't forget to add your function to a workflow! When you're finished defining and implementing your functions, the next step is to add them to [Workflows](/bolt-js/future/workflows). Once added as a step in a Workflow, your Function will run when that Workflow is invoked by a [Trigger](/bolt-js/future/triggers).

---
### Next steps
You've learned about built-in and custom functions - now it's time to jump into [Workflows](/bolt-js/future/workflows) and learn about how they work with Functions. 🎉
