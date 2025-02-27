---
title: Custom Steps
---

:::info[This feature requires a paid plan]
If you don't have a paid workspace for development, you can join the [Developer Program](https://api.slack.com/developer-program) and provision a sandbox with access to all Slack features for free.
:::


With custom steps for Bolt apps, your app can create and process workflow steps that users later add in Workflow Builder. This guide goes through how to build a custom step for your app using the [app settings](https://api.slack.com/apps). 

If you're looking to build a custom step using the Deno Slack SDK, check out our guide on [creating a custom step for Workflow Builder with the Deno Slack SDK](https://tools.slack.dev/deno-slack-sdk/tutorials/workflow-builder-custom-step/).

You can also take a look at the template for the [Bolt for JavaScript custom workflow step](https://github.com/slack-samples/bolt-js-custom-step-template) on GitHub.

There are two components of a custom step: the step definition in the app manifest, and a listener to handle the `function_executed` event in your project code. 

## Opt in to org-ready apps {#org-ready-apps}

Before we create the step definition, we first need to opt in to organization-ready apps. The app must opt-in to org-ready apps to be able to add the custom step to its manifest. This can be done in one of two ways: 

- Set the manifest `settings.org_deploy_enabled` property to `true`.
- Alternatively, navigate to your [apps](https://api.slack.com/apps), select your app, then under the **Features** section in the navigation, select **Org Level Apps** and then **Opt-In**.

Whichever method you use, the following will be reflected in the app manifest as such:

```json
    "settings": {
        "org_deploy_enabled": true,
        ...
    }
```

Next, the app must be installed at the organization level. While it is possible to install the app at a workspace level, doing so means that the custom steps will not appear in Workflow Builder. To remedy this, install the app at the organization level.

If you are a developer who is not an admin of their organization, you will need to request an Org Admin to perform this installation at the organization level. To do this:

- Navigate to your [apps](https://api.slack.com/apps) page and select the app you'd like to install.
- Under **Settings**, select **Collaborators**.
- Add an Org Admin as a collaborator.

The Org Admin can then install your app directly at the org level from the [app settings](https://api.slack.com/apps) page.

## Defining the custom step {#define-step}

A workflow step's definition contains information about the step, including its `input_parameters`, `output_parameters`, as well as display information. 

Each step is defined in the `functions` object of the manifest. Each entry in the `functions` object is a key-value pair representing each step. The key is the step's `callback_id`, which is any string you wish to use to identify the step (max 100 characters), and the value contains the details listed in the table below for each separate custom step. We recommend using the step's name, like `sample_step` in the code example below for the step's `callback_id`.

Field | Type | Description | Required? 
---- | ----- | ------------|----------
`title` | String | A string to identify the step. Max 255 characters. | Yes 
`description` | String | A succinct summary of what your step does. | No 
`input_parameters` | Object | An object which describes one or more [input parameters](#inputs-outputs) that will be available to your step. Each top-level property of this object defines the name of one input parameter available to your step.| No 
`output_parameters` | Object | An object which describes one or more [output parameters](#inputs-outputs) that will be returned by your step. Each top-level property of this object defines the name of one output parameter your step makes available. | No 

Once you are in your [app settings](https://api.slack.com/apps), navigate to **Workflow Steps** in the left nav. Click **Add Step** and fill out your step details, including callback ID, name, description, input parameters, and output parameters. 

### Defining input and output parameters {#inputs-outputs}

Step inputs and outputs (`input_parameters` and `output_parameters`) define what information goes into a step before it runs and what comes out of a step after it completes, respectively.

Both inputs and outputs adhere to the same schema and consist of a unique identifier and an object that describes the input or output.

Each input or output that belongs to `input_parameters` or `output_parameters` must have a unique key.

Field | Type | Description 
------|------|-------------
`type` | String | Defines the data type and can fall into one of two categories: primitives or Slack-specific. 
`title` | String | The label that appears in Workflow Builder when a user sets up this step in their workflow.
`description` | String | The description that accompanies the input when a user sets up this step in their workflow.
`dynamic_options` | Object | For custom steps dynamic options in Workflow Builder, define this property and point to a custom step designed to return the set of dynamic elements once the step is added to a workflow within Workflow Builder. Dynamic options in Workflow Builder can be rendered in one of two ways: as a drop-down menu (single-select or multi-select), or as a set of fields. Refer to [custom steps dynamic options in Workflow Builder](https://api.slack.com/automation/runonslack/custom-steps-dynamic-options) for more details.
`is_required` | Boolean | Indicates whether or not the input is required by the step in order to run. If it’s required and not provided, the user will not be able to save the configuration nor use the step in their workflow. This property is available only in v1 of the manifest. We recommend v2, using the `required` array as noted in the example above.
`hint` | String | Helper text that appears below the input when a user sets up this step in their workflow.

In addition, the `dynamic_options` field has two required properties:

Property | Type | Description 
------|------|-------------
`function` | String | A reference to the custom step that should be used as a dynamic option.
`inputs` | Object | Maps the inputs from the custom step consuming the dynamic option to the inputs required by the step used as a dynamic option.

For example:

```
"inputs": {
  "category": {
    "value": "{{input_parameters.category}}"
  }
}
```

Once you've added your step details, save your changes, then navigate to **App Manifest**. Notice your new step configuration reflected in the `function` property!

#### Sample manifest {#sample-manifest}

Here is a sample app manifest laying out a step definition. This definition tells Slack that the step in our workspace with the callback ID of `sample_step` belongs to our app, and that when it runs, we want to receive information about its execution event.

```json
"functions": {
    "sample_step": {
        "title": "Sample step",
        "description": "Runs sample step",
        "input_parameters": {
          "properties": {
            "user_id": {
                "type": "slack#/types/user_id",
                "title": "User",
                "description": "Message recipient",
                "hint": "Select a user in the workspace",
                "name": "user_id"
            }
          },
          "required": {
            "user_id"
          }
        },
        "output_parameters": {
          "properties": {
            "user_id": {
                "type": "slack#/types/user_id",
                "title": "User",
                "description": "User that received the message",
                "name": "user_id"
            }
          },
          "required": {
            "user_id"
          }
        },
    }
}
```

### Adding steps for existing apps {#existing-apps}

If you are adding custom steps to an existing app directly to the app manifest, you will also need to add the `function_runtime` property to the app manifest. Do this in the `settings` section as such:

```json
"settings": {
	...
	"function_runtime": "remote"
}
```

If you are adding custom steps in the **Workflow Steps** section of the [App Config](https://api.slack.com/apps) as shown above, then this will be added automatically.

## Listening to function executions {#listener}

When your custom step is executed in a workflow, your app will receive a `function_executed` event. The callback provided to the `function()` method will be run when this event is received.

The callback is where you can access `inputs`, make third-party API calls, save information to a database, update the user’s Home tab, or set the output values that will be available to subsequent workflow steps by mapping values to the `outputs` object.

Your app must call `complete()` to indicate that the step’s execution was successful, or `fail()` to signal that the step failed to complete.

Notice in the example code here that the name of the step, `sample_step`, is the same as it is listed in the manifest above. This is required.

```js
app.function('sample_step', async ({ client, inputs, complete, fail }) => {
  try {
    const { user_id } = inputs;

    await client.chat.postMessage({ 
      channel: user_id, 
      text: `Greetings <@${user_id}>!` 
    });

    await complete({ outputs: { user_id } });
  } 
  catch (error) {
    console.error(error);
    fail({ error: `Failed to complete the step: ${error}` });
  }
});
```

Here's another example. Note in this snippet, the name of the step, `create_issue`, must be listed the same as it is listed in the manifest file.

```js
app.function('create_issue', async ({ inputs, complete, fail }) => {
  try {
    const { project, issuetype, summary, description } = inputs;

    /** Prepare the URL to POST new issues to */
    const jiraBaseURL = process.env.JIRA_BASE_URL;
    const issueEndpoint = `https://${jiraBaseURL}/rest/api/latest/issue`;

    /** Set custom headers for the request */
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.JIRA_SERVICE_TOKEN}`,
      'Content-Type': 'application/json',
    };

    /** Provide information about the issue in the body */
    const body = JSON.stringify({
      fields: {
        project: Number.isInteger(project) ? { id: project } : { key: project },
        issuetype: Number.isInteger(issuetype) ? { id: issuetype } : { name: issuetype },
        description,
        summary,
      },
    });

    /** Create the issue on a project by POST request */
    const issue = await fetch(issueEndpoint, {
      method: 'POST',
      headers,
      body,
    }).then(async (res) => {
      if (res.status === 201) return res.json();
      throw new Error(`${res.status}: ${res.statusText}`);
    });

    /** Return a prepared output for the step */
    const outputs = {
      issue_id: issue.id,
      issue_key: issue.key,
      issue_url: `https://${jiraBaseURL}/browse/${issue.key}`,
    };
    await complete({ outputs });
  } catch (error) {
    console.error(error);
    await fail({ error });
  }
});
```

### Anatomy of a function listener {#anatomy}

The first argument (in our case above, `sample_step`) is the unique callback ID of the step. After receiving an event from Slack, this identifier is how your app knows which custom step handler to invoke. This `callback_id` also corresponds to the step definition provided in your manifest file. 

The second argument is the callback function, or the logic that will run when your app receives notice from Slack that `sample_step` was run by a user&mdash;in the Slack client&mdash;as part of a workflow.

Field | Description
------|------------
`client` | A `WebClient` instance used to make things happen in Slack. From sending messages to opening modals, `client` makes it all happen. For a full list of available methods, refer to the [Web API methods](/methods). Read more about the `WebClient` for Bolt JS [here](https://slack.dev/bolt-js/concepts/web-api/).
`complete` | A utility method that invokes `functions.completeSuccess`. This method indicates to Slack that a step has completed successfully without issue. When called, `complete` requires you include an `outputs` object that matches your step definition in [`output_parameters`](#inputs-outputs).
`fail` | A utility method that invokes `functions.completeError`. True to its name, this method signals to Slack that a step has failed to complete. The `fail` method requires an argument of `error` to be sent along with it, which is used to help users understand what went wrong.
`inputs` | An alias for the `input_parameters` that were provided to the step upon execution.

## Responding to interactivity {#interactivity}

Interactive elements provided to the user from within the `function()` method’s callback are associated with that unique `function_executed` event. This association allows for the completion of steps at a later time, like once the user has clicked a button.

Incoming actions that are associated with a step have the same `inputs`, `complete`, and `fail` utilities as offered by the `function()` method.

```js
// If associated with a step, step-specific utilities are made available 
app.action('approve_button', async ({ complete, fail }) => {
  // Signal the step has completed once the button is clicked  
  await complete({ outputs: { message: 'Request approved 👍' } });
});
```

## Deploying a custom step {#deploy}

When you're ready to deploy your steps for wider use, you'll need to decide *where* to deploy, since Bolt apps are not hosted on the Slack infrastructure.

Not sure where to host your app? We recommend following the [Heroku Deployment Guide](https://slack.dev/bolt-js/deployments/heroku).

### Control step access {#access}

You can choose who has access to your custom steps. To define this, refer to the [custom function access](/automation/functions/access) page.

### Distribution {#distribution}

Distribution works differently for Slack apps that contain custom steps when the app is within a standalone (non-Enterprise Grid) workspace versus within an Enterprise Grid organization.

* **Within a standalone workspace**: Slack apps that contain custom steps can be installed on the same workspace and used within that workspace. We do not support distribution to other standalone workspaces (also known as public distribution). 
* **Within an organization**: Slack apps that contain custom steps should be org-ready (enabled for private distribution) and installed on the organization level. They must also be granted access to at least one workspace in the organization for the steps to appear in Workflow Builder.

Apps containing custom steps cannot be distributed publicly or submitted to the Slack Marketplace. We recommend sharing your code as a public repository in order to share custom steps in Bolt apps.

## Related tutorials {#tutorials}

* [Custom steps for Workflow Builder (new app)](/tutorials/custom-steps-WB-new)
* [Custom steps for Workflow Builder (existing app)](/tutorials/custom-steps-WB-existing)
