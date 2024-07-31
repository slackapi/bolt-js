---
title: Creating custom functions
lang: en
slug: /concepts/creating-custom-functions
---

Custom functions allow your app to create and process workflow steps that users can add in Workflow Builder. 

We recommend using custom functions as a replacement for the deprecated Workflow Steps from Apps.

A custom function requires two components:

* [A function definition in the app’s manifest](/concepts/defining-custom-functions)
* [A listener to handle the function execution event](/concepts/listening-to-custom-functions)

Read more about custom functions in the [Slack API documentation](https://api.slack.com/automation/functions/custom-bolt).