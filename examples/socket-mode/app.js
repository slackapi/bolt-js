const { App, LogLevel, SocketModeReceiver } = require('@slack/bolt');

const clientOptions = {
  // enable this for dev instance
  // slackApiUrl: 'https://dev.slack.com/api/'
};

// const socketModeReceiver = new SocketModeReceiver({
//   appToken: process.env.APP_TOKEN,
//   installerOptions: {
//     clientOptions,
//     // use the following when running against a dev instance and using OAuth
//     // authorizationUrl: 'https://dev.slack.com/oauth/v2/authorize',
//   },

//   // enable the following if you want to use OAuth
//   // clientId: process.env.CLIENT_ID,
//   // clientSecret: process.env.CLIENT_SECRET,
//   // stateSecret: 'my-state-secret',
//   // scopes: ['channels:read', 'chat:write', 'app_mentions:read', 'channels:manage', 'commands'],

//   logLevel: LogLevel.DEBUG,
// });

const app = new App({
  // receiver: socketModeReceiver,
  token: process.env.BOT_TOKEN, //disable this if enabling OAuth in socketModeReceiver
  // logLevel: LogLevel.DEBUG,
  clientOptions,
  appToken: process.env.APP_TOKEN,
  socketMode: true,
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
})();

// Publish a App Home
app.event('app_home_opened', async ({ event, client }) => {
  await client.views.publish({
    user_id: event.user,
    view: { 
      "type":"home",
      "blocks":[
        {
          "type": "section",
          "block_id": "section678",
          "text": {
            "type": "mrkdwn",
            "text": "App Home Published"
          },
        }
      ]
    },
  });
});

// Message Shortcut example
app.shortcut('launch_msg_shortcut', async ({ shortcut, body, ack, context, client }) => {
  await ack();
  console.log(shortcut);
});

// Global Shortcut example
// setup global shortcut in App config with `launch_shortcut` as callback id
// add `commands` scope
app.shortcut('launch_shortcut', async ({ shortcut, body, ack, context, client }) => {
  try {
    // Acknowledge shortcut request
    await ack();

    // Call the views.open method using one of the built-in WebClients
    const result = await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: {
        type: "modal",
        title: {
          type: "plain_text",
          text: "My App"
        },
        close: {
          type: "plain_text",
          text: "Close"
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "About the simplest modal you could conceive of :smile:\n\nMaybe <https://api.slack.com/reference/block-kit/interactive-components|*make the modal interactive*> or <https://api.slack.com/surfaces/modals/using#modifying|*learn more advanced modal use cases*>."
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "Psssst this modal was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
              }
            ]
          }
        ]
      }
    });
  }
  catch (error) { 
    console.error(error);
  }
});


// subscribe to 'app_mention' event in your App config
// need app_mentions:read and chat:write scopes
app.event('app_mention', async ({ event, context, client, say }) => {
  try {
    await say({"blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Thanks for the mention <@${event.user}>! Click my fancy button`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Button",
            "emoji": true
          },
          "value": "click_me_123",
          "action_id": "first_button"
        }
      }
    ]});
  }
  catch (error) {
    console.error(error);
  }
});

// subscribe to `message.channels` event in your App Config
// need channels:read scope
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  // no need to directly use 'chat.postMessage', no need to include token
  await say({"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `Thanks for the mention <@${message.user}>! Click my fancy button`
			},
			"accessory": {
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": "Button",
					"emoji": true
				},
        "value": "click_me_123",
        "action_id": "first_button"
			}
		}
	]});
});

// Listen and respond to button click
app.action('first_button', async({action, ack, say, context}) => {
  console.log('button clicked');
  console.log(action);
  // acknowledge the request right away
  await ack();
  await say('Thanks for clicking the fancy button');
});

// Listen to slash command
// need to add commands permission
// create slash command in App Config
app.command('/socketslash', async ({ command, ack, say }) => {
  // Acknowledge command request
  await ack();

  await say(`${command.text}`);
});
