---
title: App manifest
order: 3
slug: app-manifests
lang: en
layout: tutorial
permalink: /future/app-manifests
---
# App manifests <span class="label-beta">BETA</span>

<div class="section-content">
An app's manifest is where you can configure its name and scopes, declare the functions your app will use, and more. 
</div>

---

### Configuring an app {#configuring-an-app}

Locate the file named `manifest.js` within your application. This will likely be in your project's root directory or a `manifest` folder. 

Inside the manifest file, you will find an `module.exports = Manifest({})` block that defines the app's configuration:

```javascript
// manifest/manifest.js

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
  },
  tokenRotationEnabled: false,
});
```
---

### Manifest properties {#manifest-properties}

The properties in the Manifest are:

|Property|Type|Has Bolt support?|Description|
|---|---|---|---|
| `runOnSlack` | Boolean |  ✅ Yes | This is a property to indicate whether an app can be deployed to Slack infrastructure. **For Bolt apps, this must be set to `false`.** You can learn more [here](/bolt-js/future/getting-started#next-gen). |
| `name` | String | ✅ Yes | This is the internal name for your app. It can contain spaces (e.g., "My App") |
| `description` |String| ✅ Yes | A short sentence describing your application. A description of your app that will help users decide whether to use it |
| `displayName` | String | ✅ Yes | (Optional) Allows a custom name for the app to be displayed that's different from the `name` |
| `longDescription` | String | ✅ Yes | (Optional) A more detailed description of your application |
| `icon` | String | ❌ No | A relative path to an image asset to use for the app's icon. Your app's profile picture that will appear in the Slack client |
| `backgroundColor` | String | ✅ Yes | (Optional) A six digit combination of numbers and letters (the hexadecimal color code) that make up the color of your app background e.g., "#000000" is the color black |
| `botScopes` | Array<string> | ✅ Yes | A list of [scopes](/scopes), or permissions, the app's Functions require |
| `functions` | Array | ✅ Yes | (Optional) A list of all Functions your app will use |
| `workflows` | Array | ✅ Yes | (Optional) A list of all Workflows your app will use |
| `outgoingDomains` | Array<string> | ✅ Yes | (Optional) If your app communicates to any external domains, list them here. Note that the outgoing domains are only restricted if the workspace has Admin approved apps on e.g., myapp.tld |
| `events` | Array | ✅ Yes | (Optional) A list of all Event structures that the app is expecting to be passed via [Message Metadata](/metadata/using) |
| `types` | Array | ✅ Yes | (Optional) A list of all [custom types](https://api.slack.com/future/types/custom) your app will use |
| `datastores` | Array | ❌ No | (Optional) A list of all [Datastores](https://api.slack.com/future/datastores) your app will use. This is currently only available for non-Bolt next-generation apps. You can learn more [here](/bolt-js/future/getting-started#next-gen).  |
| `features` | Object | ✅ Yes | (Optional)  A configuration object of your app features |

You will come back to the Manifest every time you create a new workflow, since all workflows for your app need to be added to the Manifest in order to use them.

---

### Next steps {#next-steps}

Now that you're acquainted with the Manifest, you can now dive into the world of [built-in functions](/bolt-js/future/built-in-functions) and [custom functions](/bolt-js/future/custom-functions)!
