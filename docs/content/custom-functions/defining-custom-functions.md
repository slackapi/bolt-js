---
title: Defining custom functions
lang: en
slug: /concepts/defining-custom-functions
---

To make a custom function available for use in Workflow Builder, the app’s manifest must contain a function definition. 

A function’s definition contains information about the function, including its `callback_id`, `input_parameters`, `output_parameters`, as well as display information.

To learn more about defining a function, see the [Slack API documentation](https://api.slack.com/automation/functions/custom-bolt#define-function).

```json
"functions": {
    "sample_function": {
        "title": "Sample function",
        "description": "Runs sample function",
        "input_parameters": {
            "user_id": {
                "type": "slack#/types/user_id",
                "title": "User",
                "description": "Message recipient",
                "is_required": true,
                "hint": "Select a user in the workspace",
                "name": "user_id"
            }
        },
        "output_parameters": {
            "user_id": {
                "type": "slack#/types/user_id",
                "title": "User",
                "description": "User that completed the function",
                "is_required": true,
                "name": "user_id"
            }
        }
    }
}
```