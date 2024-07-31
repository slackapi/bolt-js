---
title: Overview of Workflow Steps from Apps
lang: en
slug: /concepts/steps
---

:::danger

Workflow Steps from Apps are a deprecated feature.

Workflow Steps from Apps are different than, and not interchangable with, Slack automation workflows. We encourage those who are currently publishing Workflow Steps from Apps to consider the new [Slack automation features](https://api.slack.com/automation), such as [custom functions for Bolt](/concepts/creating-custom-functions).

Please [read the Slack API changelog entry](https://api.slack.com/changelog/2023-08-workflow-steps-from-apps-step-back) for more information.

:::

---

Workflow Steps from Apps allow your app to create and process custom workflow steps that users can add using [Workflow Builder](https://api.slack.com/workflows).

A workflow step is made up of three distinct user events:

- Adding or editing the step in a Workflow
- Saving or updating the step's configuration
- The end user's execution of the step

All three events must be handled for a workflow step to function.

Read more about Workflow Steps from Apps in the [API documentation](https://api.slack.com/legacy/workflows/steps).