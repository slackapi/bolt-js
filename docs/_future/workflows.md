---
title: Workflows
order: 4
slug: workflows
lang: en
layout: tutorial
permalink: /future/workflows
---
# Workflows <span class="label-beta">BETA</span>

<div class="section-content">
A Workflow is a set of processing steps that are executed in order. Each step in a Workflow is either a [custom function](/bolt-js/future/custom-functions) that you define or a [built-in function](/bolt-js/future/built-in-functions) that's part of `slack`. 

Workflows can be configured to run without any user input, or they can [wait for input via form](https://api.slack.com/future/forms) before continuing.
</div>

---

### Defining Workflows {#defining-workflows}

Workflows are defined in the `manifest/workflows` directory and implemented in your app's [manifest](/bolt-js/future/app-manifests).

To add a new workflow that sends a greeting to a member of a workspace, create a new file in `manifest/workflows` called `say-hello.js` and import `DefineWorkflow` and `Schema` at the top of your workflow file:

```javascript
const { DefineWorkflow } = require('@slack/bolt');
```

Then, create a **workflow definition**. This is where we'll set, at a minimum, the workflow's title and its unique callback ID:

```javascript
const SayHelloWorkflow = DefineWorkflow({
    callback_id: "say_hello_workflow",
    title: "Say Hello"
});
```

The `callback_id` is a unique string that identifies this particular component of your app, and the `title` is the display name of the workflow that shows up in slugs, unfurl cards, and certain end-user modals. These are the only two required fields. Optionally, you can configure one or more of the following: 

| Optional property | Description |
| :---------------- | :---------- |
| `description`     | An optional string description of this workflow |
| `input_parameters` | Optional input parameters, covered in ["Defining input parameters"](/bolt-js/future/workflows#defining-input-parameters)
| `output_parameters` | An object which describes one or more output parameters that will be returned by your function. This object follows the exact same pattern as `input_parameters`: top-level properties of the object define output parameter names, with the property values being an object that further describes the type and description of individual output parameters.

Once you've defined your Workflow, you'll now have access to it's `addStep` method, which is how you can call Built-in and Custom functions. The `addStep` method takes two arguments: first, the function you want to call, and second, any inputs you want to pass to that function. We'll see examples of how to do both in the following sections.


### Using built-in functions in a workflow {#workflow-builtin-functions}

To use a [built-in function](/bolt-js/future/built-in-functions), like `SendMessage`:

#### 1. Ensure that `Schema` from the SDK is imported in your workflow file: {#sdk-import}

```javascript
const { Schema } = require('@slack/bolt');
```

#### 2. Call the function with your Workflow's `addStep` method: {#add-step}

```javascript
// Example: taking the string output from a function and passing it to SendMessage
SayHelloWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: SomeWorkflow.inputs.channelId,
  message: SomeWorkflow.inputs.someString,
});
```

Here's an example of adding a step that calls a Built-in function:
```javascript
SayHelloWorkflow.addStep(Schema.slack.functions.SendMessage, {
    channel_id: "C1234567",
    message: "Hello, World!",
});
```

Here's an example of a step that calls a Custom function with a callback ID of `my_function_callback_id`:
```javascript
SayHelloWorkflow.addStep("#/functions/my_function_callback_id", {
    some_input: 12345
});
```

#### 3. Export your workflow at the bottom of the file to be imported into the manifest: {#export}
```javascript
module.exports = { SayHelloWorkflow };
```

#### 4. Declare your workflow in your app's manifest definition under the `workflow` property: {#declare-workflow}

```javascript
// manifest/manifest.js
const { SayHelloWorkflow } = require('./workflows/say-hello-workflow');

module.exports = Manifest({
    name: "sayhello",
    description: "An app with an example workflow",
    workflows: [SayHelloWorkflow], // Add your workflow here
    botScopes: [
        "commands",
        "chat:write",
        "chat:write.public",
    ],
});
```

### Using OpenForm in a workflow {#using-forms}

The only Built-in function that has an additional requirement is [`OpenForm`](https://api.slack.com/future/functions#open-a-form). When creating a Workflow that will have a step to open a form, your workflow needs to include a required `interactivity` input parameter and the call to `OpenForm` must be the **first** step in the Workflow. 

Here's an example of a basic Workflow definition using `interactivity`:

```javascript
const SayHelloWorkflow = DefineWorkflow({
    callback_id: "say_hello_workflow",
    title: "Say Hello to a user",
    input_parameters: {
        properties: {
            interactivity: {
                type: Schema.slack.types.interactivity,
            }
        },
        required: ["interactivity"]
    }
});

module.exports = { SayHelloWorkflow };
```

Visit [this guide](https://api.slack.com/future/forms) for more details and code examples of using `OpenForm` in your app. 

### Using custom functions in a workflow {#workflow-custom-functions}

To use a [custom function](/bolt-js/built-on-slack/custom-functions) that you define:

#### 1. Import the function in your workflow file where you are defining the Workflow: {#import}

```javascript
import { SomeFunction } from "../functions/some_function";
```

#### 2. Call your Function, storing its output in a variable. Here you may also pass input parameters from the Workflow into the Function itself: {#call-function}

```javascript
import { SomeFunction } from "../functions/some_function";

const SomeWorkflow = DefineWorkflow(
  callback_id: "some_workflow",
  title: "Some Workflow",
  input_parameters: {
    required: [],
    properties: {
      someString: {
        type: Schema.types.string,
        description: "Some string"
      },
      channelId: {
        type: Schema.slack.types.channel_id,
        description: "Target channel",
        default: "C1234567"
      }
    }
  }
);

const myFunctionResult = SomeWorkflow.addStep(SomeFunction, {
    // ... Pass along workflow inputs via SomeWorkflow.inputs
    // ... For example, SomeWorkflow.inputs.someString
});

module.exports = { SomeWorkflow };
```

#### 3. Use your Function in follow-on steps. For example: {#use-function}

```javascript
// Example: taking the string output from a function and passing it to SendMessage
SomeWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: SomeWorkflow.inputs.channelId,
  message: myFunctionResult.outputs.exampleOutput, // This comes from your Function definition
});
```

```javascript
// Example: invoking a custom function as a step in a workflow
SomeWorkflow.addStep("#/functions/some_function", {
    someInputVariable: SomeWorkflow.inputs.someInput
});
```

---

### Working example {#full-example}

Let's take a look at a fully functional Say Hello workflow and `manifest.js` file that contains one workflow definition, its implementation, and a completed manifest definition: 

```javascript
// manifest/workflows/say-hello.js
const { DefineWorkflow, Schema } = require('@slack/bolt');

// Define the workflow:
const SayHelloWorkflow = DefineWorkflow({
    callback_id: "say_hello_workflow",
    title: "Say Hello"
});

// Implement the workflow:
SayHelloWorkflow.addStep(Schema.slack.functions.SendDm, {
  user_id: "U1234567890", // Put your user ID here and the app will DM you
  message: "Hello, world!",
});

module.exports = { SayHelloWorkflow };

```

Below in the Manifest, the `SayHelloWorkflow` is imported and passed in:
```javascript
// manifest/manifest.js
const { Manifest } = require('@slack/bolt');
const { SayHelloWorkflow } = require('./workflows/say-hello');

module.exports = Manifest({
  name: "say-hello-app",
  description: "A demo of a Hello World workflow.",
  workflows: [SayHelloWorkflow],
  botScopes: ["commands", "chat:write", "chat:write.public"],
});
```

The above example uses the [Built-in function `SendDm`](https://api.slack.com/future/functions) to send a direct message. There are many other Built-in functions available to use, and you can also include [Custom functions](/bolt-js/future/custom-functions) that you define. 

To invoke a Workflow, you need to create a [Trigger](/bolt-js/future/triggers).

---

### Defining input parameters {#defining-input-parameters}

Workflows can pass information into both Functions and other Workflows that are part of its Workflow steps. To do this, we define what information we want to bring in to the Workflow via its `input_parameters` property. 

A Workflow's `input_parameters` property has two sub-properties: `required`, which is how you can ensure that a Workflow only executes if specific input parameters are provided, and `properties`, where you can list the specific parameters that your Workflow accounts for. Any [Built-in type](https://api.slack.com/future/types) or [Custom type](https://api.slack.com/future/types/custom) can be used.

#### Adding an input parameter to a workflow {#workflow-adding-input-parameters}

Input parameters are listed in the `properties` property. Each input parameter must include a `type` and a `description`, and can optionally include a `default` value.

```javascript
// Workflow definition
const SomeWorkflow = DefineWorkflow({
    callback_id: "some_workflow",
    title: "Some Workflow",
    input_parameters: { 
    required: [],
    properties: {
        exampleString: {
            type: Schema.types.string,
            description: "Here's an example string.",
        },
        exampleBoolean: {
            type: Schema.types.boolean,
            description: "An example boolean.",
            default: true,
        },
        exampleInteger: {
            type: Schema.types.integer,
            description: "An example integer.",
        },
        exampleChannelId: {
            type: Schema.slack.types.channel_id,
            description: "Example channel ID.",
        },
        exampleUserId: {
            type: Schema.slack.types.user_id,
            description: "Example user ID.",
        },
        exampleUsergroupId: {
            type: Schema.slack.types.usergroup_id,
            description: "Example usergroup ID.",
        },
        }
    }
});
```

Required parameters can be indicated by listing their names as strings in the `required` property of `input_parameters`. For example, here's how we can indicate that a parameter named `exampleUserId` is required:

```javascript
// Workflow definition
const SomeWorkflow = DefineWorkflow({
    callback_id: "some_workflow",
    title: "Some Workflow",
    input_parameters: { 
    required: ["exampleUserId"],
    properties: {
        exampleUserId: {
            type: Schema.slack.types.user_id,
            description: "Example user ID.",
        },
        }
    }
});
```

If a Workflow is invoked and the required input parameters are not provided, the Workflow will not execute.

> 🗣 Got 2 minutes to provide some feedback? Fill out our [Developer Survey](/bolt-js/future/feedback) and let us know what we're doing well—and what you'd like to see us improve.

---

### Onward

Once you have defined a Workflow, you're ready to [create a Trigger](/bolt-js/future/triggers) that invokes it.
