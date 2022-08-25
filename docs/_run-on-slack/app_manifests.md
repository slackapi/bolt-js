---
title: App manifest
order: 1
slug: app-manifest
lang: en
layout: tutorial
permalink: /run-on-slack/app-manifest
---
# App manifests

<div class="section-content">
An app's manifest is where you can configure its name and scopes, declare the functions your app will use, and more. 
</div>

---

### Configuring an app {#configuring-an-app}

Locate the file named `manifest.js` within your application. This will likely be in your project's root directory or a `manifest` folder. 

Inside the manifest file, you will find an `export default Manifest` block that defines the app's configuration:

```javascript
// manifest.js
const { Manifest } = require('@slack/bolt');
const { TimeOffWorkflow } = require('./workflow/approval');

module.exports = Manifest({
  runOnSlack: false,
    // This is the internal name for your app. 
  // It can contain spaces (e.g., "My App")
  name: 'take-your-time',
  displayName: 'Take Your Time',
  // A description of your app that will help users decide whether to use it.
  description: 'Request and take time off.',
  longDescription: 'Take your time off by using this application to request and take time off from your manager. Launch the workflow, put in your manager, requested PTO start and end date, and receive updates on your PTO request!',
  botScopes: ['chat:write'],
  tokenManagementEnabled: true,
  socketModeEnabled: true,
  // A list of all workflows your app will use.
  workflows: [TimeOffWorkflow],
  features: {
    appHome: {
      homeTabEnabled: true,
      messagesTabEnabled: true,
      messagesTabReadOnlyEnabled: true,
    },
  },
  settings: {
    interactivity: {
      is_enabled: true,
    },
    org_deploy_enabled: false,
  },
  tokenRotationEnabled: false,
});
```
---

### Manifest properties {#manifest-properties}

The properties in the Manifest are:

|Property|Type|Description|
|---|---|---|
| `name` | String | This is the internal name for your app. It can contain spaces (e.g., "My App") |
| `description` |String| A short sentence describing your application. A description of your app that will help users decide whether to use it |
| `displayName` | String | (Optional) Allows a custom name for the app to be displayed that's different from the `name` |
| `longDescription` | String | (Optional) A more detailed description of your application |
| `icon` | String | A relative path to an image asset to use for the app's icon. Your app's profile picture that will appear in the Slack client |
| `backgroundColor` | String | (Optional) A six digit combination of numbers and letters (the hexadecimal color code) that make up the color of your app background e.g., "#000000" is the color black |
| `botScopes` | Array<string> | A list of [scopes](/scopes), or permissions, the app's Functions require |
| `functions` | Array | (Optional) A list of all Functions your app will use |
| `workflows` | Array | (Optional) A list of all Workflows your app will use |
| `outgoingDomains` | Array<string> | (Optional) If your app communicates to any external domains, list them here. Note that the outgoing domains are only restricted if the workspace has Admin approved apps on e.g., myapp.tld |
| `events` | Array | (Optional) A list of all Event structures that the app is expecting to be passed via [Message Metadata](/metadata/using) |
| `types` | Array | (Optional) A list of all [custom types](https://api.slack.com/future/types/custom) your app will use | 
| `datastores` | Array | (Optional) A list of all [Datastores](https://api.slack.com/future/datastores) your app will use |
| `features` | Object | (Optional)  A configuration object of your app features |

You will come back to the Manifest every time you create a new function or workflow, since each function your app uses must be declared in the manifest.

---

### The Messages tab {#messages-tab}

By default, apps created with `slack create` will include both a read-only Messages tab and an About tab within Slack.

You can use the [Built-in function](/bolt-js/run-on-slack/built-in-functions) [`SendDm`](https://api.slack.com/future/functions#send-direct-message) to send users direct messages from your app&mdash;which will appear for them in the app's Messages tab.

Your app's Messages tab will be enabled and read-only by default. If you'd like to disable read-only mode and/or disable the Messages tab completely, update the `features` section of your `manifest.js` so it looks like this:
```javascript
features: {
  appHome: {
    homeTabEnabled: true,
    messagesTabEnabled: false,
    messagesTabReadOnlyEnabled: false,
  },
},
```
---
