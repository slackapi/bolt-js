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
//   // stateSecret: process.STATE_SECRET,
//   // scopes: ['channels:read', 'chat:write', 'app_mentions:read', 'channels:manage', 'commands'],

//   logLevel: LogLevel.DEBUG,
// });

const app = new App({
  // receiver: socketModeReceiver,
  token: process.env.SLACK_BOT_TOKEN, //disable this if enabling OAuth in socketModeReceiver
  clientOptions,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  logLevel: LogLevel.DEBUG,
});

(async () => {
  await app.start();
  app.logger.info('⚡️ Bolt app started');
})();

// Publish a App Home
app.event('app_home_opened', async ({ event, client }) => {
  await client.views.publish({
    user_id: event.user,
    view: {
      type: 'home',
      blocks: [
        {
          type: 'section',
          block_id: 'section678',
          text: {
            type: 'mrkdwn',
            text: 'App Home Published',
          },
        },
      ],
    },
  });
});

// Message Shortcut example
app.shortcut('launch_msg_shortcut', async ({ shortcut, body, ack, context, client, logger }) => {
  await ack();
  logger.info(shortcut);
});

// Global Shortcut example
// setup global shortcut in App config with `launch_shortcut` as callback id
// add `commands` scope
app.shortcut('launch_shortcut', async ({ shortcut, body, ack, context, client, logger }) => {
  try {
    // Acknowledge shortcut request
    await ack();

    // Call the views.open method using one of the built-in WebClients
    const result = await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: 'My App',
        },
        close: {
          type: 'plain_text',
          text: 'Close',
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'About the simplest modal you could conceive of :smile:\n\nMaybe <https://api.slack.com/reference/block-kit/interactive-components|*make the modal interactive*> or <https://api.slack.com/surfaces/modals/using#modifying|*learn more advanced modal use cases*>.',
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: 'Psssst this modal was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>',
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    logger.error(error);
  }
});

// subscribe to 'app_mention' event in your App config
// need app_mentions:read and chat:write scopes
app.event('app_mention', async ({ event, context, client, logger, say }) => {
  try {
    await say({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Thanks for the mention <@${event.user}>! Click my fancy button`,
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Button',
              emoji: true,
            },
            value: 'click_me_123',
            action_id: 'first_button',
          },
        },
      ],
    });
  } catch (error) {
    logger.error(error);
  }
});

// subscribe to `message.channels` event in your App Config
// need channels:read scope
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  // no need to directly use 'chat.postMessage', no need to include token
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Thanks for the mention <@${message.user}>! Click my fancy button`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Button',
            emoji: true,
          },
          value: 'click_me_123',
          action_id: 'first_button',
        },
      },
    ],
  });
});

// Listen and respond to button click
app.action('first_button', async ({ action, ack, say, context, logger }) => {
  logger.info('button clicked');
  logger.info(action);
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

// Respond to a link with a Block Kit unfurl
app.event('link_shared', async ({ event, client, logger }) => {
  try {
    await client.chat.unfurl({
      channel: event.channel,
      ts: event.message_ts,
      unfurls: {
        'https://myappdomain.com/id/123': {
          blocks: [
            {
              type: 'section',
              text: { type: 'mrkdwn', text: 'Take a look at this carafe, just another cousin of glass' },
              accessory: {
                type: 'image',
                image_url: 'https://gentle-buttons.com/img/carafe-filled-with-red-wine.png',
                alt_text: "Stein's wine carafe",
              },
            },
          ],
        },
      },
    });
  } catch (error) {
    logger.error(error);
  }
});

const APP_DOMAIN_UNFURL_URL = 'https://myappdomain.com/id/123';

const sample_file_entity = {
  app_unfurl_url: APP_DOMAIN_UNFURL_URL,
  entity_type: 'slack#/entities/file',
  external_ref: {
    id: 'F012345678',
  },
  url: APP_DOMAIN_UNFURL_URL,
  entity_payload: {
    attributes: {
      title: {
        text: 'Hello World',
      },
      product_name: 'My Product',
    },
    slack_file: {
      id: 'F012345678',
      type: 'png',
    },
    fields: {
      preview: {
        alt_text: 'My File',
        slack_file: {
          id: 'F012345678',
        },
      }
    },
  },
};

const sample_item_entity = {
  entity_type: 'slack#/entities/item',
  external_ref: { id: '1234' },
  url: APP_DOMAIN_UNFURL_URL,
  app_unfurl_url: APP_DOMAIN_UNFURL_URL,
  entity_payload: {
    attributes: {
      title: {
        text: 'Generic type of entity',
      },
      display_type: 'Custom Type',
    },
    custom_fields: [
      {
        key: 'my-markdown-string',
        label: 'my Markdown string',
        value: '## Hello World',
        type: 'string',
        format: 'markdown',
      },
      {
        type: 'slack#/types/timestamp',
        key: 'timestamp_key',
        label: 'Timestamp',
        value: '1747496700',
        edit: {
          enabled: true,
        },
      },
      {
        key: 'custom_img',
        label: 'image',
        type: 'slack#/types/image',
        image_url:
          'https://previews.us-east-1.widencdn.net/preview/48045879/assets/asset-view/8588de84-f8ed-4488-a456-45ba986280ee/thumbnail/eyJ3IjoyMDQ4LCJoIjoyMDQ4LCJzY29wZSI6ImFwcCJ9?sig.ver=1&sig.keyId=us-east-1.20240821&sig.expires=1757779200&sig=dGrBibQWSfcZlEC3QcG7GHA0MBkT6kMG8HkQGo-FTww',
      },
      {
        key: 'life',
        label: 'Meaning of Life',
        value: 42,
        type: 'integer',
      },
      {
        type: 'string',
        key: 'external_select_key',
        label: 'External Select',
        value: 'Joe Smith',
        tag_color: 'gray',
        edit: {
          enabled: true,
          select: {
            current_value: 'joe-smith',
            fetch_options_dynamically: true,
          },
        },
      },
      {
        key: 'string-array',
        label: 'String Array',
        item_type: 'string',
        type: 'array',
        value: [
          {
            value: 'abra',
          },
          {
            value: 'kadabra',
          },
        ],
      },
    ],
  },
};

// Respond to a link with a work object unfurl
app.event('link_shared', async ({ event, client, logger }) => {
  try {
    await client.chat.unfurl({
      channel: event.channel,
      ts: event.message_ts,
      metadata: {
        entities: [sample_file_entity],
      },
    });
  } catch (error) {
    logger.error(error);
  }
});

app.event('entity_details_requested', async ({ event, client, logger }) => {
  try {
    await client.entity.presentDetails({
      metadata: sample_item_entity,
      trigger_id: event.trigger_id,
    });
  } catch (error) {
    logger.error(error);
  }
});
