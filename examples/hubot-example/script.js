// Exercise: port the Hubot example script to the Bolt API.
//
// The commented sections are from the Hubot example script, while the uncommented sections below them are the
// same functionality using Bolt.

// module.exports = (robot) => {

// =====================================
// === Variable Declerations ===
// =====================================

// Create a constant with Grettings you can add more to this if you like by putting more in if you wish
// Just follow the syntax below
const enterReplies = ['Hi', 'Target Acquired', 'Firing', 'Hello friend.', 'Gotcha', 'I see you']
// Create a constant  with Leave Replies you can add more to this if you like by putting more in if you wish
// Just follow the syntax below
const leaveReplies = ['Are you still there?', 'Target lost', 'Searching']

// LOL responses again you can add more following this convention below
const lulz = ['lol', 'rofl', 'lmao'];

// Grab a random LOL value
const randomLulz = () => lulz[Math.floor(Math.random() * lulz.length)];
// Grab a random greeting from above
const randomEnterReply = () => enterReplies[Math.floor(Math.random() * enterReplies.length)];
// Grab a random Leave Reply
const randomLeaveReply = () => leaveReplies[Math.floor(Math.random() * leaveReplies.length)];

// This is pulled from your .env file so if you can change the answer in this file

const answer = process.env.HUBOT_ANSWER_TO_THE_ULTIMATE_QUESTION_OF_LIFE_THE_UNIVERSE_AND_EVERYTHING

// Let annoyIntervalId be null to start

let annoyIntervalId = null

//Pull in the .env file for use in this file
require('dotenv').config()

// Create a constant with App and Direct mention methods

const { App, directMention } = require('../../dist');
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

(async () => {
  //Start up the app
  const server = await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!', server.address());
})();

  // robot.hear(/badger/i, (res) => {
  //   res.send('Badgers? BADGERS? WE DON’T NEED NO STINKIN BADGERS')
  // })

// If someone says badgers the bot respondes with Badgers? BADGERS? WE DON’T NEED NO STINKIN BADGERS
app.message('badger', async ({ say }) => { await say('Badgers? BADGERS? WE DON’T NEED NO STINKIN BADGERS'); });

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

// I never go this one to work maybe you need to say open the pod bay?

app.message(/open the (.*) doors/i, async ({ say, context }) => {
    const doorType = context.matches[1];

    const text = (doorType === 'pod bay') ?
      'I’m afraid I can’t let you do that.' :
      `Opening ${doorType} doors`;

    await say(text);
});

  // robot.hear(/I like pie/i, (res) => {
  //   res.emote('makes a freshly baked pie')
  // })

// If you say I like pie the bot repondes with pie emoji
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



  // robot.respond(`/${lulz.join('|')}/i`, (res) => {
  //   res.send(res.random(lulz))
  // })



// If someone says lol it will respond with a random response.  You could change this to directMention
// This would make the bot only respond if you @botname lol perhaps this is annoying

app.event('app_mention', ({ say }) => say(randomLulz()));
// OR
// app.message(directMention(), ({ say }) => say(randomLulz()));

  // robot.topic((res) => {
  //   res.send(`${res.message.text}? That’s a Paddlin`)
  // })

  // 🚫 there's no Events API event type for channel topic changed.


  // robot.enter((res) => {
  //   res.send(res.random(enterReplies))
  // })
  // robot.leave((res) => {
  //   res.send(res.random(leaveReplies))
  // })


// If a new user enters the chat respond with a random gretting
app.event('member_joined_channel', async ({ say }) => { await say(randomEnterReply()); });

// If a user leaves respond with a random Leave reply
app.event('member_left_channel', async ({ say }) => { await say(randomLeaveReply());  });


  // robot.respond(/what is the answer to the ultimate question of life/, (res) => {
  //   if (answer) {
  //     res.send(`${answer}, but what is the question?`)
  //     return
  //   }
  //
  //   res.send('Missing HUBOT_ANSWER_TO_THE_ULTIMATE_QUESTION_OF_LIFE_THE_UNIVERSE_AND_EVERYTHING in environment: please set and try again')
  // })

// If you ask what i the the answer to the ulimate question of life it will resond with what is in your .env file
app.message(
    directMention(),
    'what is the answer to the ultimate question of life',
    async ({ say }) => {
      if (answer) { await say(`${answer}, but what is the question?`); }
    });

  // robot.respond(/you are a little slow/, (res) => {
  //   setTimeout(() => res.send('Who you calling "slow"?'), 60 * 1000)
  // })

// If you are a little slow it will respond in 60 * 1000 seconds with Who you calling "slow"?
app.message('you are a little slow', async ({ say, context }) => {
      setTimeout(async function() { await say(`Who you calling "_slow_"`) }, 60 * 1000);
});

//end listening for someone to say the bot is slow
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

// This example is quite annoying to say the least if you @botname annoy me
// It will annoy you with AAAAAAAAAAAEEEEEEEEEEEEEEEEEEEEEEEEIIIIIIIIHHHHHHHHHH
// Until you tell it to stop wiht @botname unannoy me

app.message(directMention(), /(?<!un)annoy me/, async ({ say }) => {
    if (annoyIntervalId) {
      await say('AAAAAAAAAAAEEEEEEEEEEEEEEEEEEEEEEEEIIIIIIIIHHHHHHHHHH');
      return;
    }

    await say('Hey, want to hear the most annoying sound in the world?');
    annoyIntervalId = setInterval(() => {
      say('AAAAAAAAAAAEEEEEEEEEEEEEEEEEEEEEEEEIIIIIIIIHHHHHHHHHH');
    }, 1000);
  });

app.message(directMention(), 'unannoy me', async ({ say }) => {
    if (!annoyIntervalId) {
      await say('Not annoying you right now, am I?');
      return;
    }
    await say('OKAY, OKAY, OKAY!');
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

// Possibly not needed the built in error handler will output errors to the console anyway
// Could use a try{} catch{} around something where you wish to halt the program if an error occurs

app.error(async (error) => {
    // Check the details of the error to handle cases where you should retry sending a message or stop the app
    const message = `DOES NOT COMPUTE: ${error.toString()}`;
    console.error(message);
});

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
// This example really does not work without a converstation store for me it just keeps saying Sure!
// It should after 4 requests to have a soda it should say I'm to fizzy..

app.message(directMention(), 'have a soda', async ({ context, say }) => {
  // Initialize conversation
  const conversation = context.conversation !== undefined ? context.conversation : {};

  // Initialize data for this listener
  conversation.sodasHad = conversation.sodasHad !== undefined ? conversation.sodasHad : 0;

  if (conversation.sodasHad > 4) {
    await say('I\'m too fizzy...');
    return;
  }

  await say('Sure!');
  conversation.sodasHad += 1;
  try {
    await context.updateConversation(conversation);
  } catch (error) {
    console.error(error);
  }
});
// if you say @botnam sleep it off.  It responds with zzzz
app.message(directMention(), 'sleep it off', async ({ context, say }) => {
  try {
    await context.updateConversation({ ...context.conversation, sodasHad: 0 });
    await say('zzzzz');
  } catch (error) {
    console.error(error);
  }
});
