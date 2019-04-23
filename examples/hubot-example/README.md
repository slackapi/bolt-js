# Hubot example

The [Hubot](https://hubot.github.com/) bot framework introduces you to its capabilities using a helpful
[example script](https://github.com/hubotio/generator-hubot/blob/master/generators/app/templates/scripts/example.js).
Bolt has many of the same capabilities. Whether you're migrating your Hubot to Bolt, or are looking for examples on
how Bolt might handle some common tasks, this example helps you understand Bolt a little better.

## Set up

Before running this example app, you'll need to [create a Slack app](https://api.slack.com/apps?new_app=1), configure
it, and install it into a development workspace.

1. **Add a Bot user**. Choose any display name and user name you like.
2. **Enable the Events API**. Input a Request URL, wait for it to be verified, and save it. This step may require
[getting a public URL that can be used for development](https://slack.dev/node-slack-sdk/tutorials/local-development).
The app will be listening on the path `/slack/events`.
3. **Subscribe to Bot Events**: `app_mention`, `member_joined_channel`, `member_left_channel`, `message.channels`,
`message.groups`, `message.im`, `message.mpim`.
4. **Install the app to the development workspace**.

Once these steps are complete, you should have a Bot User access token and the Signing Secret. These values will be
used below.

## Run the app

1. Clone this repository: `git clone https://github.com/slackapi/bolt.git`

2. Install dependencies and build: `cd bolt; npm install`

3. Start the app, substituting your own values into the environment variables:

```shell
$ SLACK_SIGNING_SECRET=<Your signing secret> SLACK_BOT_TOKEN=<Your Bot User access token> HUBOT_ANSWER_TO_THE_ULTIMATE_QUESTION_OF_LIFE_THE_UNIVERSE_AND_EVERYTHING=42 node examples/hubot-example/script.js
```

## Try it out

Read through the various examples in `script.js` in this directory. Try messaging the bot user to test how each listener
behaves.
