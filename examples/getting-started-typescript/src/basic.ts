/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable import/no-internal-modules */
import './utils/env';
import { App, LogLevel, subtype, BotMessageEvent, BlockAction } from '@slack/bolt';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
});

/**
 * Listening to messages
 */
// This will match any message that contains 👋
app.message(':wave:', async ({ message, say }) => {
  if (message.subtype === undefined || message.subtype === 'bot_message') {
    await say(`Hello, <@${message.user}>`);
  }
});

/**
 * Sending messages
 */
// Listens for messages containing "knock knock" and responds with an italicized "who's there?"
app.message('knock knock', async ({ say }) => {
  await say('_Who\'s there?_');
});

// Sends a section block with datepicker when someone reacts with a 📅 emoji
app.event('reaction_added', async ({ event, client }) => {
  // Could be a file that was reacted upon
  if (event.reaction === 'calendar' && event.item.type === 'message') {
    await client.chat.postMessage({
      text: 'Pick a reminder date',
      channel: event.item.channel,
      blocks: [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Pick a date for me to remind you',
        },
        accessory: {
          type: 'datepicker',
          action_id: 'datepicker_remind',
          initial_date: '2019-04-28',
          placeholder: {
            type: 'plain_text',
            text: 'Select a date',
          },
        },
      }],
    });
  }
});

/**
 * Listening to events
 */
const welcomeChannelId = 'C12345';

// When a user joins the team, send a message in a predefined channel asking them to introduce themselves
app.event('team_join', async ({ event, client, logger }) => {
  try {
    // Call chat.postMessage with the built-in client
    const result = await client.chat.postMessage({
      channel: welcomeChannelId,
      text: `Welcome to the team, <@${event.user}>! 🎉 You can introduce yourself in this channel.`,
    });
    logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});

app.message(subtype('bot_message'), async ({ message, logger }) => {
  const botMessage = (message as BotMessageEvent);
  logger.info(`The bot user ${botMessage.user} said ${botMessage.text}`);
});

/**
 * Using the Web API
 */
// Unix Epoch time for September 30, 2019 11:59:59 PM
const whenSeptemberEnds = '1569887999';

app.message('wake me up', async ({ message, client, logger }) => {
  try {
    // Call chat.scheduleMessage with the built-in client
    const result = await client.chat.scheduleMessage({
      channel: message.channel,
      post_at: whenSeptemberEnds,
      text: 'Summer has come and passed',
    });
  } catch (error) {
    logger.error(error);
  }
});

/**
 * Listening to actions
 */
// Your listener function will be called every time an interactive component
// with the action_id "approve_button" is triggered
app.action('approve_button', async ({ ack }) => {
  await ack();
  // Update the message to reflect the action
});

// Your listener function will only be called when the action_id matches 'select_user'
// AND the block_id matches 'assign_ticket'
app.action<BlockAction>({ action_id: 'select_user', block_id: 'assign_ticket' },
  async ({ body, client, ack, logger }) => {
    await ack();
    try {
      // Make sure the event is not in a view
      if (body.message) {
        await client.reactions.add({
          name: 'white_check_mark',
          timestamp: body.message?.ts,
          channel: body.channel?.id,
        });
      }
    } catch (error) {
      logger.error(error);
    }
  });

// Your middleware will be called every time an interactive component with the action_id “approve_button” is triggered
app.action('approve_button', async ({ ack, say }) => {
  // Acknowledge action request
  await ack();
  await say('Request approved 👍');
});

(async () => {
  // Start your app
  await app.start(Number(process.env.PORT) || 3000);

  console.log('⚡️ Bolt app is running!');
})();
