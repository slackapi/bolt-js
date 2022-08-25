---
title: Custom functions
order: 3
slug: custom-functions
lang: en
layout: tutorial
permalink: /run-on-slack/custom-functions
---
# Custom functions

<div class="section-content">
On the next-generation platform, you can build custom **Run On Slack functions**, reusable building blocks of automation that are deployed to our infrastructure and accept inputs, perform some calculations, and provide outputs. Functions can be used as steps in [Workflows](/bolt-js/run-on-slack/workflows)&mdash;and Workflows are invoked by [Triggers](/bolt-js/run-on-slack/triggers).

To create a Run On Slack function, we need to do three things: 
- [define the function](#define) in the Manifest;
- [implement the function](#implement) in its respective source file;
- [distribute the function](#distribute) so others can use it.
</div>

---

### Defining a function {#define}


---

### Implementing a function {#implement}

Implement functions in two steps:

1. Create the source file in `manifest/functions`
2. Write code in the source file to define your function
3. Add function listener and handler(s)
4. Add function to app through workflow or manifest

---

### Distributing a function {#distribute}

A newly created Run On Slack [Function](https://api.slack.com/future/functions) will only be accessible to it's creator until it is **distributed** to others.

To distribute a Function so that another user (or many users) can build workflows that reference that function, you'll use the `distribute` command. At this time, Functions can be distributed to _everyone_ in a workspace, your app's _collaborators_, or _specific users_. 

In order to enable the `distribute` command, your app must have been [deployed](https://api.slack.com/future/deploy) _atleast once before_ attempting to distribute your function to others.

To learn more about distributing a function, you can visit the guide [here](https://api.slack.com/future/functions/custom#distribute).