// Exercise: port the Hubot example script to the Bolt API.
//
// The commented sections are from the Hubot example script, while the uncommented sections below them are the
// same functionality using Bolt.

// module.exports = (robot) => {

const { App, directMention } = require('../../dist');
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

(async () => {
  const server = await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!', server.address());
})();

  // robot.hear(/badger/i, (res) => {
  //   res.send('Badgers? BADGERS? WE DON’T NEED NO STINKIN BADGERS')
  // })

app.message('badger', ({ say }) => say('Badgers? BADGERS? WE DON’T NEED NO STINKIN BADGERS'));

  // robot.respond(/open the (.*) doors/i, (res) => {
  //   const doorType = res.match[1]
  //
  //   if (doorType === 'pod bay') {
  //     res.reply('I’m afraid I can’t let you do that.')
  //     return
  //   }
  //
  //   res.reply('Opening #{doorType} doors')
  // })

app.message(/open the (.*) doors/i, ({ say, context }) => {
  const doorType = context.matches[1];

  const text = (doorType === 'pod bay') ?
    'I’m afraid I can’t let you do that.' :
    `Opening ${doorType} doors`;

  say(text);
});

  // robot.hear(/I like pie/i, (res) => {
  //   res.emote('makes a freshly baked pie')
  // })

app.message('I like pie', async ({ message, context }) => {
  try {
    await app.client.reactions.add({
      token: context.botToken,
      name: 'pie',
      channel: message.channel,
      timestamp: message.ts,
    });
  } catch (error) {
    console.error(error);
  }
});

const lulz = ['lol', 'rofl', 'lmao'];

  // robot.respond(`/${lulz.join('|')}/i`, (res) => {
  //   res.send(res.random(lulz))
  // })

const randomLulz = () => lulz[Math.floor(Math.random() * lulz.length)];

app.event('app_mention', ({ say }) => say(randomLulz()));
// OR
// app.message(directMention(), ({ say }) => say(randomLulz()));

  // robot.topic((res) => {
  //   res.send(`${res.message.text}? That’s a Paddlin`)
  // })

  // 🚫 there's no Events API event type for channel topic changed.

const enterReplies = ['Hi', 'Target Acquired', 'Firing', 'Hello friend.', 'Gotcha', 'I see you']
const leaveReplies = ['Are you still there?', 'Target lost', 'Searching']

  // robot.enter((res) => {
  //   res.send(res.random(enterReplies))
  // })
  // robot.leave((res) => {
  //   res.send(res.random(leaveReplies))
  // })

const randomEnterReply = () => enterReplies[Math.floor(Math.random() * enterReplies.length)];
const randomLeaveReply = () => leaveReplies[Math.floor(Math.random() * leaveReplies.length)];

app.event('member_joined_channel', ({ say }) => say(randomEnterReply()));
app.event('member_left_channel', ({ say }) => say(randomLeaveReply()));

const answer = process.env.HUBOT_ANSWER_TO_THE_ULTIMATE_QUESTION_OF_LIFE_THE_UNIVERSE_AND_EVERYTHING

  // robot.respond(/what is the answer to the ultimate question of life/, (res) => {
  //   if (answer) {
  //     res.send(`${answer}, but what is the question?`)
  //     return
  //   }
  //
  //   res.send('Missing HUBOT_ANSWER_TO_THE_ULTIMATE_QUESTION_OF_LIFE_THE_UNIVERSE_AND_EVERYTHING in environment: please set and try again')
  // })

app.message(
  directMention(),
  'what is the answer to the ultimate question of life',
  ({ say }) => {
    if (answer) { say(`${answer}, but what is the question?`); }
  });

  // robot.respond(/you are a little slow/, (res) => {
  //   setTimeout(() => res.send('Who you calling "slow"?'), 60 * 1000)
  // })

app.message('you are a little slow', ({ say }) => {
  setTimeout(() => say('Who you calling "slow"?'), 60 * 1000);
});

let annoyIntervalId = null

  // robot.respond(/annoy me/, (res) => {
  //   if (annoyIntervalId) {
  //     res.send('AAAAAAAAAAAEEEEEEEEEEEEEEEEEEEEEEEEIIIIIIIIHHHHHHHHHH')
  //     return
  //   }
  //
  //   res.send('Hey, want to hear the most annoying sound in the world?')
  //   annoyIntervalId = setInterval(() => res.send('AAAAAAAAAAAEEEEEEEEEEEEEEEEEEEEEEEEIIIIIIIIHHHHHHHHHH'), 1000)
  // })
  //
  // robot.respond(/unannoy me/, (res) => {
  //   if (!annoyIntervalId) {
  //     res.send('Not annoying you right now, am I?')
  //     return
  //   }
  //
  //   res.send('OKAY, OKAY, OKAY!')
  //   clearInterval(annoyIntervalId)
  //   annoyIntervalId = null
  // })

app.message(directMention(), /(?<!un)annoy me/, ({ say }) => {
  if (annoyIntervalId) {
    say('AAAAAAAAAAAEEEEEEEEEEEEEEEEEEEEEEEEIIIIIIIIHHHHHHHHHH');
    return;
  }

  say('Hey, want to hear the most annoying sound in the world?');
  annoyIntervalId = setInterval(() => {
    say('AAAAAAAAAAAEEEEEEEEEEEEEEEEEEEEEEEEIIIIIIIIHHHHHHHHHH');
  }, 1000);
});

app.message(directMention(), 'unannoy me', ({ say }) => {
  if (!annoyIntervalId) {
    say('Not annoying you right now, am I?');
    return;
  }
  say('OKAY, OKAY, OKAY!');
  clearInterval(annoyIntervalId);
  annoyIntervalId = null;
});

  // robot.router.post('/hubot/chatsecrets/:room', (req, res) => {
  //   const room = req.params.room
  //   const data = JSON.parse(req.body.payload)
  //   const secret = data.secret
  //
  //   robot.messageRoom(room, `I have a secret: ${secret}`)
  //
  //   res.send('OK')
  // })

  // 🚫 stand up your own express router

  // robot.error((error, response) => {
  //   const message = `DOES NOT COMPUTE: ${error.toString()}`
  //   robot.logger.error(message)
  //
  //   if (response) {
  //     response.reply(message)
  //   }
  // })

app.error((error) => {
  const message = `DOES NOT COMPUTE: ${error.toString()}`;
  console.error(message);

  // 🚫 no reply handling from global error handler
});

  // robot.respond(/have a soda/i, (response) => {
  //   // Get number of sodas had (coerced to a number).
  //   const sodasHad = +robot.brain.get('totalSodas') || 0
  //
  //   if (sodasHad > 4) {
  //     response.reply('I’m too fizzy…')
  //     return
  //   }
  //
  //   response.reply('Sure!')
  //   robot.brain.set('totalSodas', sodasHad + 1)
  // })
  //
  // robot.respond(/sleep it off/i, (res) => {
  //   robot.brain.set('totalSodas', 0)
  //   res.reply('zzzzz')
  // })

// NOTE: In a real application, you should provide a convoStore option to the App constructor. The default convoStore
//       only persists data to memory, so its lost when the process terminates.
app.message(directMention(), 'have a soda', async ({ context, say }) => {
  // Initialize conversation
  const conversation = context.conversation !== undefined ? context.conversation : {};

  // Initialize data for this listener
  conversation.sodasHad = conversation.sodasHad !== undefined ? conversation.sodasHad : 0;

  if (conversation.sodasHad > 4) {
    say('I\'m too fizzy...');
    return;
  }

  say('Sure!');
  conversation.sodasHad += 1;
  try {
    await context.updateConversation(conversation);
  } catch (error) {
    console.error(error);
  }
});

app.message(directMention(), 'sleep it off', async ({ context, say }) => {
  try {
    await context.updateConversation({ ...context.conversation, sodasHad: 0 });
    say('zzzzz');
  } catch (error) {
    console.error(error);
  }
});
