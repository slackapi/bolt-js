# Bolt for JavaScript Message Metadata

This is a quick example app to test [Message Metadata](https://api.slack.com/metadata) with Bolt for JavaScript.

Before we get started, make sure you have a development workspace where you have permissions to install apps. If you don’t have one setup, go ahead and [create one](https://slack.com/create). You also need to [create a new app](https://api.slack.com/apps?new_app=1) if you haven’t already. You will need to enable Socket Mode and generate an App Level Token.

## Install Dependencies

```
npm install
```

## Subscribe to Message Metadata events

Go to the Events Subscription page from your app configuration, and subscribe to `message_metadata_deleted`, `message_metadata_posted`, and `message_metadata_updated` bot events. Additionally, go to the App Manifest page and update the `metadata subscriptions` like the following:

```
settings:
  event_subscriptions:
    bot_events:
      - message_metadata_deleted
      - message_metadata_posted
      - message_metadata_updated
    metadata_subscriptions:
      - app_id: YOUR_APP_ID
        event_type: my_event
```

## Setup Environment Variables

This app requires you setup a few environment variables. You can find these values in your [app configuration](https://api.slack.com/apps).

```bash
export SLACK_BOT_TOKEN=YOUR_SLACK_BOT_TOKEN
export SLACK_APP_TOKEN=YOUR_SLACK_APP_TOKEN
```

## Run the App

Start the app with the following command:

```
npm start
```