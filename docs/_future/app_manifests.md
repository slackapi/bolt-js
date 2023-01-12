---
title: App manifest
order: 1
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

Inside the manifest file, you will find an `module.exports = Manifest({})` block that defines the app's configuration. For the [Hello World application](https://github.com/slack-samples/bolt-js-starter-template/tree/future) in the Bolt for JavaScript Starter Template, it will look something like this:

```javascript
// manifest/manifest.js
const { Manifest } = require('@slack/bolt');
const { SampleWorkflow } = require('./workflow/sample-workflow');

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
module.exports = Manifest({
  runOnSlack: false,
  name: 'Bolt Template App TEST',
  displayName: 'Bolt Template App TEST',
  description: 'A starter app template built with Bolt JS',
  botScopes: ['channels:history', 'chat:write', 'commands', 'chat:write.public'],
  eventSubscriptions: { bot_events: ['app_home_opened', 'message.channels'] },
  socketModeEnabled: true,
  workflows: [SampleWorkflow],
  features: {
    appHome: {
      homeTabEnabled: true,
      messagesTabEnabled: false,
      messagesTabReadOnlyEnabled: true,
    },
    botUser: {
      always_online: false,
    },
    shortcuts: [{
      name: 'Run sample shortcut',
      type: 'global',
      callback_id: 'sample_shortcut_id',
      description: 'Runs a sample shortcut',
    }],
    slashCommands: [{
      command: '/sample-command',
      description: 'Runs a sample command',
      should_escape: false,
    }],
  },
  settings: {
    interactivity: {
      is_enabled: true,
    },
  },
});
```
---

### Manifest properties {#manifest-properties}

The properties in the manifest are:

|Property|Type|Has Bolt support?|Description|
|---|---|---|---|
| `runOnSlack` | Boolean |  ✅ Yes | This is a property to indicate whether an app can be deployed to Slack infrastructure. **For Bolt apps, this must be set to `false`.** You can learn more [here](/bolt-js/future/getting-started#next-gen). |
| `name` | String | ✅ Yes | This is the internal name for your app. It can contain spaces (e.g., "My App") |
| `description` |String| ✅ Yes | A short sentence describing your application. A description of your app that will help users decide whether to use it |
| `displayName` | String | ✅ Yes | (Optional) Allows a custom name for the app to be displayed that's different from the `name` |
| `longDescription` | String | ✅ Yes | (Optional) A more detailed description of your application |
| `icon` | String | ❌ No | A relative path to an image asset to use for the app's icon. Your app's profile picture that will appear in the Slack client |
| `backgroundColor` | String | ✅ Yes | (Optional) A six digit combination of numbers and letters (the hexadecimal color code) that make up the color of your app background e.g., "#000000" is the color black |
| `botScopes` | Array<string> | ✅ Yes | A list of [scopes](/scopes), or permissions, the app's functions require |
| `functions` | Array | ✅ Yes | (Optional) A list of all functions your app will use |
| `workflows` | Array | ✅ Yes | (Optional) A list of all workflows your app will use |
| `outgoingDomains` | Array<string> | ✅ Yes | (Optional) If your app communicates to any external domains, list them here. Note that the outgoing domains are only restricted if the workspace has Admin approved apps on e.g., myapp.tld |
| `events` | Array | ✅ Yes | (Optional) A list of all event structures that the app is expecting to be passed via [Message Metadata](/metadata/using) |
| `types` | Array | ✅ Yes | (Optional) A list of all [custom types](https://api.slack.com/future/types/custom) your app will use |
| `datastores` | Array | ❌ No | (Optional) A list of all [datastores](https://api.slack.com/future/datastores) your app will use. This is currently only available for non-Bolt next-generation apps. You can learn more [here](/bolt-js/future/getting-started#next-gen).  |
| `features` | Object | ✅ Yes | (Optional)  A configuration object of your app features |

You will come back to the manifest every time you create a new workflow, since all workflows for your app need to be added to the manifest in order to use them.

---

### Next steps {#next-steps}

Now that you're acquainted with the manifest, you can dive into the world of [built-in functions](/bolt-js/future/built-in-functions) and [custom functions](/bolt-js/future/custom-functions)!
