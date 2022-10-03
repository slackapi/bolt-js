---
title: Migrate an existing app
order: 9
slug: migrate-existing-app
lang: en
layout: tutorial
permalink: /future/migrate-existing-app
---

# Migrate an existing app <span class="label-beta">BETA</span>

<div class="section-content">
If you have an existing Slack app written with Bolt for JavaScript that you'd like to migrate to the [next-generation platform](/bolt-js/future/getting-started#next-gen), this guide is for you!
</div>

If you do not have an existing Bolt for JavaScript application but are looking to get started with the [next-gen platform](/bolt-js/future/getting-started#next-gen), check out the [Getting Started](/bolt-js/future/getting-started) guide.

---
### Prerequisites {#prerequisites}

Before we get started, make sure you've followed the steps up to the "Accept the Beta Terms of Service" section to install required dependencies in the [Getting Started guide](/bolt-js/future/getting-started).

---

### Set up your app to work with the Slack CLI {#setup-with-cli}

Clone your app to your local file system.

Update your project's version of Bolt in your _package.json_ to the `next-gen` distribution and reinstall your dependencies: `rm -rf node_modules package-lock.json && npm install`

```bash
  "dependencies": {
    "@slack/bolt": "next-gen",
  }
```

Add a `slack.json` file to your local project root containing [this](https://github.com/slack-samples/bolt-js-starter-template/blob/future/slack.json).


---
### Add your manifest {#manifest-in-code}

Head to [your app's App Config Page](https://api.slack.com/apps) and navigate to Features > App Manifest. Download a copy of your app manifest in the JSON file format. 

Add this `manifest.json` to your project root. This represents your project's existing configuration.

Now let's add a new file in the project root entitled `manifest.js` and initialize a `Manifest` with the `runOnSlack` property set to false. 

```js
const { Manifest } = require('@slack/bolt');
module.exports = Manifest({
    runOnSlack: false,
});
``` 

<p class="alert alert_info"><ts-icon class="ts_icon_info_circle"></ts-icon> `runOnSlack` is a required property of the manifest if you intend to use next-generation platform features - Functions, Workflows, Triggers. 

It means that your app will run on your own hosting solution and not on Slack and currently must be set to `false`</p>

Bolt will handle merging properties defined in this `Manifest()` and in any `manifest.json` in the project, but we encourage you to begin to migrate other features into code. Check out our more detailed guide on [App Manifests](/bolt-js/future/app-manifests).

---

Now let's run the Slack CLI command `slack manifest` to generate your merged manifest. It should contain at least these settings.  

```bash
{
  "_metadata": {
    "major_version": 2
  },
  "oauth_config": {
    "token_management_enabled": true  
  },
  "settings": {
    "interactivity": {
      "is_enabled": true
    },
    "function_runtime": "remote",   
  },
  "org_deploy_enabled": true       
}
```

Run `slack manifest validate` to validate your App's configuration with Slack API.

---
### Run your app! {#tada}

Run the Slack CLI command `slack run` to start your app in local development.

The CLI will create and install a new development app for you with its own App ID, allowing you to keep your testing changes separate from your production App). It will also start your app in local development mode (SocketMode) and turn logging on. 

Now you're ready to start adding [Functions](/bolt-js/future/built-in-functions) and [Workflows](/bolt-js/future/workflows) to your app!

---
### Updating your app configuration {#update-app}

You have probably made changes to your app’s manifest (adding a Function or a Workflow, for example). To sync your production app’s configuration with the changes you’ve made in development:

* Authenticate the Slack CLI with your desired production workspace using `slack login`.
* Head over to `./slack/apps.json` and make sure an entry exists for your workspace with the current `app_id` and `team_id` of the workspace. 

```bash
{
  "apps": {
    "<your-workspace-name>": {
      "name": "<your-workspace-name>",
      "app_id": "A041G4M3U00",
      "team_id": "T038J6TH5PF"
    }
  },
  "default": "<your-workspace-name>"
}
```

* Run `slack install` and select your app. Select your workspace from the list prompt to install.

---
### Conclusion {#conclusion}

Congratulations on migrating your app to the your next-generation Slack Platform! 🎉 You can continue your journey by learning about [App Manifests](/bolt-js/future/app-manifests) or looking into adding [Functions](/bolt-js/future/built-in-functions) and [Workflows](/bolt-js/future/workflows) to your app!