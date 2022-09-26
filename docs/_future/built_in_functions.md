---
title: Built-in functions
order: 2
slug: built-in-functions
lang: en
layout: tutorial
permalink: /future/built-in-functions
---
# Built-in functions <span class="label-beta">BETA</span>

<div class="section-content">
Slack provides built-in functions you can use alongside your [custom functions](/bolt-js/future/custom-functions) in a Workflow. Built-in functions are essentially Slack-native actions, like creating a channel or sending a message, that work hand-in-hand with your functions.

<p class="alert alert_info"><ts-icon class="ts_icon_info_circle"></ts-icon> Please note that some built-in functions may be restricted due to Workspace permission settings. Reach out to a Workspace owner if these aren't available to you.</p>

</div>

---

### Using with Workflows {#workflows}

Built-in functions need to be imported from the standard library built into the SDK — all built-in functions are children of the `Schema.slack.functions` object. Just like custom Functions, built-ins are then added to steps in a Workflow using the `addStep` method. That's it! 

Built-in functions define their own inputs and outputs, as detailed for each built-in below.

Here's an example of a Workflow that creates a new Slack channel using the `CreateChannel` built-in function:

```javascript
const { DefineWorkflow, Schema } = require('@slack/bolt');

...

const createChannelStep = myWorkflow.addStep(
  Schema.slack.functions.CreateChannel,
  {
    channel_name: myWorkflow.inputs.channel_name,
    is_private: false,
  },
);
```

Read the full documentation for [Workflows](/bolt-js/future/workflows) to learn how to build out Workflows.

---

### Built-in functions list {#list}

You can view a full list of built-in functions [here](https://api.slack.com/future/functions#built-in-functions__built-in-functions).

---

### Next steps {#next-steps}

Now that you've taken a dive into built-in functions, you can explore [custom functions](/bolt-js/future/custom-functions) and what they have to offer. ✨

