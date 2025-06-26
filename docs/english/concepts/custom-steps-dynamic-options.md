# Custom Steps dynamic options for Workflow Builder

## Background {#background}

[Legacy steps from apps](https://docs.slack.dev/changelog/2023-08-workflow-steps-from-apps-step-back) previously enabled Slack apps to create and process custom workflow steps, which could then be shared and used by anyone in Workflow Builder. To support your transition away from them, custom steps used as dynamic options are available. These allow you to use data defined when referencing the step in Workflow Builder as inputs to the step.

## Example use case {#use-case}

Let's say a builder wants to add a custom step in Workflow Builder that creates an issue in an external issue-tracking system. First, they'll need to specify a project. Once a project is selected, a project-specific list of fields can be presented to them to choose from when creating the issue.

As a developer, dynamic options allow you to supply data to input parameters of custom steps so that you can provide builders with varying sets of fields based on the builders' selections.

In this example, the primary step would invoke a separate project selection step that retrieves the list of available projects. The builder-selected item from the  retrieved list would then be used as the input to the secondary issue creation step.

There are two parts necessary for Slack apps to support dynamic options: custom step definitions, and handling custom step dynamic options. We'll take a look at both in the following sections.

## Custom step definitions {#custom-step-definitions}

When defining an input to a custom step intended to be dynamic (rather than explicitly defining a set of input parameters up front), you'll define a `dynamic_options` property that points to another custom step designed to return the set of dynamic elements once this step is added to a workflow from Workflow Builder.

An input parameter for a custom step can reference a different custom step that defines what data is available for it to return. One Slack app could even use another Slack app’s custom step to define dynamic options for one of its inputs.

The following code snippet from our issue creation example discussed above shows a `create-issue` custom step that will be used as a workflow step. Another custom step, the `get-projects` step, will dynamically populate the project input parameter to be configured by a builder. This `get-projects` step provides an `array` containing projects fetched dynamically from the external issue-tracking system.

```js
    "functions": {
        "create-issue": {
            "title": "Create Issue",
            "description": "",
            "input_parameters": {
                "support_channel": {
                    "type": "slack#/types/channel_id",
                    "title": "Support Channel",
                    "description": "",
                    "name": "support_channel"
                },
                "project": {
                    "type": "string",
                    "title": "Project",
                    "description": "A project from the issue tracking system",
                    "is_required": true,
                    "dynamic_options": {
                        "function": "#/functions/get-projects",
                        "inputs": {}
                    }
                },
            },
            "output_parameters": {}
        },
        "get-projects": {
            "title": "Get Projects",
            "description": "Get the available project from the issue tracking system",
            "input_parameters": {},
            "output_parameters": {
                "options": {
                    "type": "slack#/types/options_select",
                    "title": "Project Options", 
                }
            }
        }
    },
```
### Defining the `function` and `inputs` attributes {#define-attributes}

Defining the `function` and `inputs` attributes of the `dynamic_options` property would look as follows: 

```
"dynamic_options": {
    "function": "#/functions/get-projects",
    "inputs": {}
}
```

The `function` attribute specifies the step reference used to resolve the options of the input parameter. For example: `"#/functions/get-projects"`.

The `inputs` attribute defines the parameters to be passed as inputs to the step referenced by the `function` attribute. For example:

```
"inputs": {
    "selected_user_id": {
        "value": "{{input_parameters.user_id}}"
    },
    "query": {
        "value": "{{client.query}}"
    }
}
```

The following format can be used to reference any input parameter defined by the step: `{{input_parameters.<PARAMETER_NAME>}}`.

In addition, the `{{client.query}}` parameter can be used as a placeholder for an input value. The `{{client.builder_context}}` parameter will inject the [`slack#/types/user_context`](https://tools.slack.dev/deno-slack-sdk/reference/slack-types/#usercontext) of the user building the workflow as the value to the input parameter.

### Types of dynamic options UIs {#dynamic-option-UIs}

The above example demonstrates one possible UI to be rendered for builders: a single-select drop-down menu of dynamic options. However, dynamic options in Workflow Builder can be rendered in one of two ways: as a drop-down menu (single-select or multi-select), or as a set of fields.

The type is dictated by the output parameter of the custom step used as a dynamic option. In order to use a custom step in a dynamic option context, its output must adhere to a defined interface, that is, it must have an `options` parameter of type [`options_select`](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#options_select) or [`options_field`](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#options_field), as shown in the following code snippet.

```js
"output_parameters": {
    "options": {
        "type": "slack#/types/options_select" or "slack#/types/options_field",
        "title": "Custom Options",
        "description": "Options to be used in a dynamic context",
    }
   ...
}
```

#### Drop-down menus {#drop-down}

Your dynamic input parameter can be rendered as a drop-down menu, which will use the options obtained from a custom step with an `options` output parameter of the type [`options_select`](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#options_select).

The drop-down menu UI component can be rendered in two ways: single-select, or multi-select. To render the dynamic input as a single-select menu, the input parameter defining the dynamic option must be of the type [`string`](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#string).

```js
"step-with-dynamic-input": {
    "title": "Step that uses a dynamic input",
    "description": "This step uses a dynamic input rendered as a single-select menu",
    "input_parameters": {
        "dynamic_single_select": {
            "type": "string", // this must be of type string for single-select
            "title": "dynamic single select drop-down menu",
            "description": "A dynamically-populated single-select drop-down menu",
            "is_required": true,
            "dynamic_options": {
                "function": "#/functions/get-options",
                "inputs": {},
            },
        }
    },
    "output_parameters": {}
}
```

To render the dynamic input as a multi-select menu, the input parameter defining the dynamic option must be of the type [`array`](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#array), and its `items` must be of type [`string`](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#string).

```js
"step-with-dynamic-input": {
    "title": "Step that uses a dynamic input",
    "description": "This step uses a dynamic input rendered as a multi-select menu",
    "input_parameters": {
        "dynamic_multi_select": {
            "type": "array", // this must be of type array for multi-select
            "items": {
                "type": "string"
            },
            "title": "dynamic single select drop-down menu",
            "description": "A dynamically-populated multi-select drop-down menu",
            "dynamic_options": {
                "function": "#/functions/get-options",
                "inputs": {},
            },
        }
    },
    "output_parameters": {}
}
```

#### Fields {#fields}

In the code snippet below, the input parameter is rendered as a set of fields with keys and values. The option fields are obtained from a custom step with an `options` output parameter of type [`options_field`](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#options_field).

The input parameter that defines the dynamic option must be of type [`object`](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#object), as the completed set of fields in Workflow Builder will be passed to the custom step as an [untyped object](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#untyped-object) during workflow execution.

```js
"test-field-dynamic-options": {
    "title": "Test dynamic field options",
    "description": "",
    "input_parameters": {
        "dynamic_fields": {
            "type": "object",
            "title": "Dynamic custom field options",
            "description": "A dynamically-populated section of input fields",
            "dynamic_options": {
                "function": "#/functions/get-field-options",
                "inputs": {}
                "selection_type": "key-value",
            }
        }
    },
    "output_parameters": {}
}
```

### Dynamic option types {#dynamic-option-types}

As mentioned earlier, in order to use a custom step as a dynamic option, its output must adhere to a defined interface: it must have an `options` output parameter of the type either [`options_select`](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#options_select) or [`options_field`](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#options_field). 

To take a look at these in more detail, refer to our [Options Slack type](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#options) documentation.

## Dynamic options handler {#dynamic-option-handler}

Each custom step defined in the manifest needs a corresponding handler in your Slack app. Although implemented similarly to existing function execution event handlers, there are two key differences between regular custom step invocations and those used for dynamic options:

* The custom step must have an `options` output parameter that is of type [`options_select`](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#options_select) or [`options_field`](https://tools.slack.dev/deno-slack-sdk/reference/slack-types#options_field).
* The [`function_executed`](https://docs.slack.dev/reference/events/function_executed) event must be handled synchronously. This optimizes the response time of returned dynamic options and provides a crisp builder experience.

### Asynchronous event handling {#async}

By default, the [Bolt family of frameworks](https://tools.slack.dev/) handles `function_executed` events asynchronously. 

For example, the various modal-related API methods provide two ways to update a view: synchronously using a `response_action` HTTP response, or asynchronously using a separate HTTP API call. Using the asynchronous approach allows developers to handle events free of timeouts, but this isn't desired for dynamic options as it introduces delays and violates our stated goal of providing a crisp builder experience.

### Synchronous event handling {#sync}

Dynamic options support synchronous handling of `function_executed` events. By ensuring that the function execution’s state is complete with output parameters provided before responding to the `function_executed` event, Slack can quickly provide Workflow Builder with the requisite dynamic options.

### Implementation {#implementation}

To optimize the response time of dynamic options, you must acknowledge the incoming event after calling the [`function.completeSuccess`](https://docs.slack.dev/reference/methods/functions.completeSuccess) or [`function.completeError`](https://docs.slack.dev/reference/methods/functions.completeError) API methods, minimizing asynchronous latency. The `function.completeSuccess` and `function.completeError` API methods are invoked in the complete and fail helper functions.

A new `auto_acknowledge` flag allows you more granular control over whether specific event handlers should operate in synchronous or asynchronous response modes in order to enable a smooth dynamic options experience.

#### Example {#bolt-js}

In [Bolt for JavaScript](https://tools.slack.dev/bolt-js/), you can pass an `{ autoAcknowledge: false }` options object to a function listener. This allows you to manually control when the `await ack()` helper function is executed and implement synchronous `function_executed` event handling.

```js
app.function('get-projects', { autoAcknowledge: false }, async ({ ack, complete }) => {
  try {
    complete({
        outputs: {
            options: [
            {
                text: {
                    type: 'plain_text',
                    text: 'Secret Squirrel Project',
                },
                value: 'p1',
            },
            {
                text: {
                    type: 'plain_text',
                    text: 'Public Kangaroo Project',
                },
                value: 'p2',
            },
          ],
        },
      });
  } finally {
    await ack();
  }
});
```

✨  **To learn more about the Bolt family of frameworks and tools**, check out our [Slack Developer Tools](https://tools.slack.dev/).
