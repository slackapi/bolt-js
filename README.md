[![Sponsored by Beep Boop](https://img.shields.io/badge/%E2%9D%A4%EF%B8%8F_sponsored_by-%E2%9C%A8_Robots%20%26%20Pencils%20%2F%20Beep%20Boop_%E2%9C%A8-FB6CBE.svg)](https://beepboophq.com)
[![Build Status](https://travis-ci.org/BeepBoopHQ/slapp.svg)](https://travis-ci.org/BeepBoopHQ/slapp)
[![Coverage Status](https://coveralls.io/repos/github/BeepBoopHQ/slapp/badge.svg)](https://coveralls.io/github/BeepBoopHQ/slapp)

# Slapp
Slapp is a node.js module for creating Slack integrations from simple slash commands to complex bots. It is specifically for Slack --not a generic bot framework-- because we believe the best restaurants in the world are not buffets. 🍴😉

Slapp heavily favors the new HTTP based [Slack Events API](https://api.slack.com/events-api) over [Realtime Messaging API](https://api.slack.com/rtm) websockets for creating more scalable and manageable bots. It supports simple conversation flows with state managed out of process to survive restarts and horizontal scaling. Conversation flows aren't just message based but may include any Slack event, [interactive buttons](https://api.slack.com/docs/message-buttons), [slash commands](https://api.slack.com/slash-commands), etc.

Slapp is built on a strong foundation with a test suite with 100% test coverage and depends on the [smallwins/slack](https://github.com/smallwins/slack) client.

Here is a basic example:
```js
const Slapp = require('slapp')
const BeepBoopContext = require('slapp-context-beepboop')
if (!process.env.PORT) throw Error('PORT missing but required')

var slapp = Slapp({ context: BeepBoopContext() })

slapp.message('^(hi|hello|hey).*', ['direct_mention', 'direct_message'], (msg, text, greeting) => {
  msg
    .say(`${greeting}, how are you?`)
    .route('handleHowAreYou')  // where to route the next msg in the conversation
})

// register a route handler
slapp.route('handleHowAreYou', (msg) => {
  // respond with a random entry from array
  msg.say(['Me too', 'Noted', 'That is interesting'])
})

// attach handlers to an Express app
slapp.attachToExpress(require('express')()).listen(process.env.PORT)
```

## Install

```
npm install --save slapp
```

## Getting Started
We recommend you watch this [quick tutorial](https://www.youtube.com/watch?v=q9iMeRbrgpw) on how to get started with Slapp on BeepBoop! It'll talk you through some of these key points:

* Creating your first Slapp application
* Adding your application to [Beep Boop](https://beepboophq.com)
* Setting up a Slack App ready to work with Slapp / Beep Boop

Even if you're not using Beep Boop the video should help you understand how to get your Slack App setup properly so you can make the most of Slapp.

## Setup
You can call the Slapp function with the following options:
```js
const Slapp = require('slapp')
const ConvoStore = require('slapp-convo-beepboop')
const BeepBoopContext = require('slapp-context-beepboop')

var slapp = Slapp({
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  convo_store: ConvoStore(),
  context: BeepBoopContext(),
  log: true,
  colors: true
})
```

### Context Lookup
One of the challenges with writing a multi-team Slack app is that you need to make sure you have the appropriate tokens and meta-data for a team when you get a message from them. This lets you make api calls on behalf of that team in response to incoming messages from Slack. You typically collect and store this meta-data during the **Add to Slack** OAuth flow. If you're running on [Beep Boop][beepboop], this data is saved for you automatically. Slapp has a required `context` option that gives you a convenient hook to load that team-specific meta-data and enrich the message with it.  While you can add whatever meta-data you have about a team in this function, there are a few required properties that need to be set on `req.slapp.meta` for Slapp to process requests:

+ `app_token` - **required** OAuth `access_token` property
+ `bot_token` - **required if you have a bot user** OAuth `bot.bot_access_token` property
+ `bot_user_id` - **required if you have a bot user** OAuth `bot.bot_user_id` property
+ `app_bot_id` - **required if you have a bot user and use ignoreSelf option** Profile call with bot token, `users.profile.bot_id` property

The incoming request from Slack has been parsed and normalized by the time the `context` function runs, and is available via `req.slapp`.  You can rely on this data in your `context` function to assist you in looking up the necessary tokens and meta-data.

`req.slapp` has the following structure:
```js
{
  type: 'event|command|action',
  body: {}, // original payload from Slack
  meta: {
    user_id: '<USER_ID>',
    channel_id: '<CHANNEL_ID>',
    team_id: '<TEAM_ID>'
  }
}
```

If you're running on [Beep Boop][beepboop], these values are stored and added automatically for you, otherwise you'll need to set these properties on `req.slapp.meta` with data retreived from wherever you're storing your OAuth data. That might look something like this:
```js
// your database module...
var myDB = require('./my-db')

var slapp = Slapp({
  context (req, res, next) {
    var meta = req.slapp.meta

    myDB.getTeamData(meta.team_id, (err, data) => {
      if (err) {
        console.error('Error loading team data: ', err)
        return res.send(err)
      }

      // mixin necessary team meta-data
      req.slapp.meta = Object.assign(req.slapp.meta, {
        app_token: data.app_token,
        bot_token: data.bot_token,
        bot_user_id: data.bot_user_id,
        // you can add your own team meta-data as well
        other_value: data.other_value
      })
    })
  }
})
```

### Message Middleware
Slapp supports middleware for incoming events, allowing you to stop the propagation
of the event by not calling `next()`, passively observing, or appending metadata
to the message by adding properties to `msg.meta`. Middleware is processed in the
order it is added.

Register new middleware with `use`:

```
slapp.use(fn(msg, next))
```

For example, simple middleware that logs all incoming messages:

```
slapp.use((msg, next) => {
  console.log(msg)
  next()
})
```

Or that does some validation:

```
slapp.use((msg, next) => {
  if (valid) {
    next()
  } else {
    console.error('uh oh')
  }
})
```

## Slack Events
Listen for any Slack event with `slapp.event(event_name, (msg) => {})`.

```js
// add a smile reaction by the bot for any message reacted to
slapp.event('reaction_added', (msg) => {
  let token = msg.meta.bot_token
  let timestamp = msg.body.event.item.ts
  let channel = msg.body.event.item.channel
  slapp.client.reactions.add({token, name: 'smile', channel, timestamp}, (err) => {
    if (err) console.log('Error adding reaction', err)
  })
})
```

![Slack Events Demo](https://storage.googleapis.com/beepboophq/_assets/slackapp/demo-event.gif)

## Slack Event Messages
A message is just a subtype of Slack event but has a special convenience method `slapp.message(regex, [types], (msg) => {})`:

```js
slapp.message('goodnight', 'mention', (msg) => {
  msg.say('sweet dreams :crescent_moon: ')
})
```
![Slack Message Demo](https://storage.googleapis.com/beepboophq/_assets/slackapp/demo-message.gif)


## Interactive Messages
`msg.say()` may be passed text, an array of text values (one is chosen randomly), or an object to be sent to [`chat.postMessage`](https://api.slack.com/methods/chat.postMessage). It defaults to the current channel and the bot user token (or app token if there is not bot user). Here's an example of using `msg.say()` to send an interactive message and registering a handler to receive the button action:

```js
slapp.message('yesno', (msg) => {
  msg.say({
      text: '',
      attachments: [
        {
          text: '',
          fallback: 'Yes or No?',
          callback_id: 'yesno_callback',
          actions: [
            { name: 'answer', text: 'Yes', type: 'button', value: 'yes' },
            { name: 'answer', text: 'No',  type: 'button',  value: 'no' }
          ]
        }]
      })
})

slapp.action('yesno_callback', 'answer', (msg, value) => {
  msg.respond(msg.body.response_url, `${value} is a good choice!`)
})
```

![Interactive Message Demo](https://storage.googleapis.com/beepboophq/_assets/slackapp/demo-interactive.gif)

## Slash Commands

```js
slapp.command('/inorout', /^in/, (msg) => {
  // `respond` is used for actions or commands and uses the `response_url` provided by the
  // incoming request from Slack
  msg.respond(`Glad you are in ${match}!`)
})
```

![Slash Command Demo](https://storage.googleapis.com/beepboophq/_assets/slackapp/demo-slash.gif)


You can also match on text after the command similar to messages like this:
```js
slapp.command('/inorout', 'create (.*)', (msg, text, question) => {
  // if "/inorout create Who is in?" is received:
  // text = create Who is in?
  // question = Who is in?
})
```

## Conversations and Bots
With Slapp you can use the Slack Events API to create bots much like you would with a
a Realtime Messaging API socket. Events over HTTP may be not necessarily be received by
the same process if you are running multiple instances of your app behind a load balancer;
therefore your Slapp process should be stateless. And thus conversation state should be
stored out of process.

You can pass a conversation store implementation into the Slapp factory with the `convo_store` option. If you are using [Beep Boop](https://beepboophq.com), you should use `require('slapp-convo-beepboop')()` and it will be handled for you. Otherwise, a conversation store needs to implement these three functions:

```js
  set (id, params, callback) {} // callback(err)
  get (id, callback)            // callback(err, val)
  del (id, callback) {}         // callback(err)
```

The [in memory implementation](https://github.com/BeepBoopHQ/slapp/blob/master/src/conversation_store/memory.js) can be used for testing and as an example when creating your own implementation.

### What is a conversation?
A conversation is scoped by the combination of Slack Team, Channel, and User. When
you register a new route handler (see below), it will only be invoked when receiving
a message from the same team in the same channel by the same user.

### Conversation Routing
Conversations use a very simple routing mechanism. Within any msg handler you may
call `msg.route` to designate a handler for the next msg received in a conversation.
The handler must be preregistered with the same key through `slapp.route`.

For example, if we register a route handler under the key `handleGoodDay`:

```js
slapp.route('handleGoodDay', (msg) => {
  msg.say(':expressionless:')
})
```

We can route to that in a `msg` handler like this:

```js
slapp.message('^hi', 'direct_message', (msg) => {
  msg.say('Are you having a good day?').route('handleGoodDay')
})
```

The route handler will get called for this conversation no matter what type of event
it is. This means you can use any slack events, slash commands interactive message actions,
and the like in your conversation flows. If a route handler is registered, it will
supercede any other matcher.

### Conversation State and Expiration
When specifying a route handler with `msg.route` you can optionally pass an arbitrary
object and expiration time in seconds.

Consider the example below. If a user says "do it" in a direct message then ask
for confirmation using an interactive message. If they do something other than
answer by pressing a button, redirect them to choose one of the options, yes or no.
When they choose, handle the response accordingly.

Notice the `state` object that is passed to `msg.route` and into `slapp.route`. Each time `msg.route` is called an expiration time of 60 seconds is set. If
there is not activity by the user for 60 seconds, we expire the conversation flow.


```js
// if a user says "do it" in a DM
slapp.message('do it', 'direct_message', (msg) => {
  var state = { requested: Date.now() }
  // respond with an interactive message with buttons Yes and No
  msg
  .say({
    text: '',
    attachments: [
      {
        text: 'Are you sure?',
        fallback: 'Are you sure?',
        callback_id: 'doit_confirm_callback',
        actions: [
          { name: 'answer', text: 'Yes', type: 'button', value: 'yes' },
          { name: 'answer', text: 'No', type: 'button', value: 'no' }
        ]
      }]
    })
  // handle the response with this route passing state
  // and expiring the conversation after 60 seconds
  .route('handleDoitConfirmation', state, 60)
})

slapp.route('handleDoitConfirmation', (msg, state) => {
  // if they respond with anything other than a button selection,
  // get them back on track
  if (msg.type !== 'action') {
    msg
      .say('Please choose a Yes or No button :wink:')
      // notice we have to declare the next route to handle the response
      // every time. Pass along the state and expire the conversation
      // 60 seconds from now.
      .route('handleDoitConfirmation', state, 60)
    return
  }

  let answer = msg.body.actions[0].value
  if (answer !== 'yes') {
    // the answer was not affirmative
    msg.respond(msg.body.response_url, {
      text: `OK, not doing it. Whew that was close :cold_sweat:`,
      delete_original: true
    })
    // notice we did NOT specify a route because the conversation is over
    return
  }

  // use the state that's been passed through the flow to figure out the
  // elapsed time
  var elapsed = (Date.now() - state.requested)/1000
  msg.respond(msg.body.response_url, {
    text: `You requested me to do it ${elapsed} seconds ago`,
    delete_original: true
  })

  // simulate doing some work and send a confirmation.
  setTimeout(() => {
    msg.say('I "did it"')
  }, 3000)
})
```

![Conversation Demo](https://storage.googleapis.com/beepboophq/_assets/slackapp/demo-doit.gif)

# API

# slapp

  - [slapp()](#slappoptsobject)

## slapp(opts:Object)

  Create a new Slapp, accepts an options object
  
  Parameters
  - `opts.verify_token` Slack Veryify token to validate authenticity of requests coming from Slack
  - `opts.convo_store` Implementation of ConversationStore, defaults to memory
  - `opts.context` `Function (req, res, next)` HTTP Middleware function to enrich incoming request with context
  - `opts.log` defaults to `true`, `false` to disable logging
  - `opts.colors` defaults to `process.stdout.isTTY`, `true` to enable colors in logging
  - `opts.ignoreSelf` defaults to `true`, `true` to automatically ignore any messages from yourself. This flag requires the context to set `meta.app_bot_id` with the Slack App's users.profile.bot_id.
  - `opts.ignoreBots` defaults to `false`, `true` to ignore any messages from bot users automatically
  
  Example
  
  
```js
  var Slapp = require('slapp')
  var BeepBoopConvoStore = require('slapp-convo-beepboop')
  var BeepBoopContext = require('slapp-context-beepboop')
  var slapp = Slapp({
    record: 'out.jsonl',
    context: BeepBoopContext(),
    convo_store: BeepBoopConvoStore({ debug: true })
  })
```



# Slapp

  - [Slapp.use()](#slappusefnfunction)
  - [Slapp.attachToExpress()](#slappattachtoexpressappobjectoptsobject)
  - [Slapp.route()](#slapproutefnkeystringfnfunction)
  - [Slapp.getRoute()](#slappgetroutefnkeystring)
  - [Slapp.match()](#slappmatchfnfunction)
  - [Slapp.message()](#slappmessagecriteriastringtypefilterstringarray)
  - [Slapp.event()](#slappeventcriteriastringregexpcallbackfunction)
  - [Slapp.action()](#slappactioncallbackidstringactionnamecriteriastringregexpactionvaluecriteriastringregexpcallbackfunction)
  - [Slapp.command()](#slappcommandcommandstringcriteriastringregexpcallbackfunction)

## Slapp.use(fn:function)

  Register a new middleware, processed in the order registered.
  
#### Parameters
  - `fn`: middleware function `(msg, next) => { }`
  
  
#### Returns
  - `this` (chainable)

## Slapp.attachToExpress(app:Object, opts:Object)

  Attach HTTP routes to an Express app
  
  Routes are:
  - POST `/slack/event`
  - POST `/slack/command`
  - POST `/slack/action`
  
#### Parameters
  - `app` instance of Express app or Express.Router
  - `opts.event` `boolean|string` - event route (defaults to `/slack/event`) [optional]
  - `opts.command` `boolean|string` - command route (defaults to `/slack/command`) [optional]
  - `opts.action` `boolean|string` - action route (defaults to `/slack/action`) [optional]
  
  
#### Returns
  - `app` reference to Express app or Express.Router passed in
  
  
  Examples:
  
```js
  // would attach all routes w/ default paths
  slapp.attachToExpress(app)
```

  
```js
  // with options
  slapp.attachToExpress(app, {
    event: true, // would register event route with default of /slack/event
    command: false, // would not register a route for commands
    action: '/slack-action' // custom route for actions
  })
```

  
```js
  // would only attach a route for events w/ default path
  slapp.attachToExpress(app, {
    event: true
  })
```

## Slapp.route(fnKey:string, fn:function)

  Register a new function route
  
#### Parameters
  - `fnKey` unique key to refer to function
  - `fn` `(msg, state) => {}`
  
  
#### Returns
  - `this` (chainable)

## Slapp.getRoute(fnKey:string)

  Return a registered route
  
#### Parameters
  - `fnKey` string - unique key to refer to function
  
  
#### Returns
  - `(msg, state) => {}`

## Slapp.match(fn:function)

  Register a custom Match function (fn)
  
#### Returns `true` if there is a match AND you handled the msg.
  Return `false` if there is not a match and you pass on the message.
  
  All of the higher level matching convenience functions
  generate a match function and call `match` to register it.
  
  Only one matcher can return true, and they are executed in the order they are
  defined. Match functions should return as fast as possible because it's important
  that they are efficient. However you may do asyncronous tasks within to
  your hearts content.
  
#### Parameters
  - `fn` function - match function `(msg) => { return bool }`
  
  
#### Returns
  - `this` (chainable)

## Slapp.message(criteria:string, typeFilter:string|Array)

  Register a new message handler function for the criteria
  
#### Parameters
  - `criteria` text that message contains or regex (e.g. "^hi")
  - `typeFilter` [optional] Array for multiple values or string for one value. Valid values are `direct_message`, `direct_mention`, `mention`, `ambient`
  - `callback` function - `(msg, text, [match1], [match2]...) => {}`
  
  
#### Returns
  - `this` (chainable)
  
  Example with regex matchers:
  
```js
  slapp.message('^play (song|artist) <([^>]+)>', (msg, text, type, toplay) => {
    // text = 'play artist spotify:track:1yJiE307EBIzOB9kqH1deb'
    // type = 'artist'
    // toplay = 'spotify:track:1yJiE307EBIzOB9kqH1deb'
  }
```

  
  Example without matchers:
  
```js
  slapp.message('play', (msg, text) => {
    // text = 'play'
  }
```

  
  Example `msg.body`:
  
```js
 {
    "token":"dxxxxxxxxxxxxxxxxxxxx",
    "team_id":"TXXXXXXXX",
    "api_app_id":"AXXXXXXXX",
    "event":{
       "type":"message",
       "user":"UXXXXXXXX",
       "text":"hello!",
       "ts":"1469130107.000088",
       "channel":"DXXXXXXXX"
    },
    "event_ts":"1469130107.000088",
    "type":"event_callback",
    "authed_users":[
       "UXXXXXXXX"
    ]
 }
```

## Slapp.event(criteria:string|RegExp, callback:function)

  Register a new event handler for an actionName
  
#### Parameters
  - `criteria` the type of event
  - `callback` `(msg) => {}`
  
  
#### Returns
  - `this` (chainable)
  
  
  Example `msg` object:
  
```js
  {
     "token":"dxxxxxxxxxxxxxxxxxxxx",
     "team_id":"TXXXXXXXX",
     "api_app_id":"AXXXXXXXX",
     "event":{
        "type":"reaction_added",
        "user":"UXXXXXXXX",
        "item":{
           "type":"message",
           "channel":"DXXXXXXXX",
           "ts":"1469130181.000096"
        },
        "reaction":"grinning"
     },
     "event_ts":"1469131201.822817",
     "type":"event_callback",
     "authed_users":[
        "UXXXXXXXX"
     ]
  }
```

## Slapp.action(callbackId:string, actionNameCriteria:string|RegExp, actionValueCriteria:string|RegExp, callback:function)

  Register a new action handler for an actionNameCriteria
  
#### Parameters
  - `callbackId` string
  - `actionNameCriteria` string or RegExp - the name of the action [optional]
  - `actionValueCriteria` string or RegExp - the value of the action [optional]
  - `callback` function - `(msg, text, [match1], [match2]...) => {}`
  
  
#### Returns
  - `this` (chainable)
  
  Example:
  
```js
  // match name and value
  slapp.action('dinner_callback', 'drink', 'beer', (msg, val) => {}
  // match name and value either beer or wine
  slapp.action('dinner_callback', 'drink', '(beer|wine)', (msg, val) => {}
  // match name drink, any value
  slapp.action('dinner_callback', 'drink', (msg, val) => {}
  // match dinner_callback, any name or value
  slapp.action('dinner_callback', 'drink', (msg, val) => {}
  // match with regex
  slapp.action('dinner_callback', /^drink$/, /^b[e]{2}r$/, (msg, val) => {}
```

  
  Example `msg.body` object:
  
```js
  {
     "actions":[
        {
           "name":"answer",
           "value":":wine_glass:"
        }
     ],
     "callback_id":"in_or_out_callback",
     "team":{
        "id":"TXXXXXXXX",
        "domain":"companydomain"
     },
     "channel":{
        "id":"DXXXXXXXX",
        "name":"directmessage"
     },
     "user":{
        "id":"UXXXXXXXX",
        "name":"mike.brevoort"
     },
     "action_ts":"1469129995.067370",
     "message_ts":"1469129988.000084",
     "attachment_id":"1",
     "token":"dxxxxxxxxxxxxxxxxxxxx",
     "original_message":{
        "text":"What?",
        "username":"In or Out",
        "bot_id":"BXXXXXXXX",
        "attachments":[
           {
              "callback_id":"in_or_out_callback",
              "fallback":"Pick one",
              "id":1,
              "actions":[
                 {
                    "id":"1",
                    "name":"answer",
                    "text":":beer:",
                    "type":"button",
                    "value":":beer:",
                    "style":""
                 },
                 {
                    "id":"2",
                    "name":"answer",
                    "text":":beers:",
                    "type":"button",
                    "value":":wine:",
                    "style":""
                 },
              ]
           },
           {
              "text":":beers: • mike.brevoort",
              "id":2,
              "fallback":"who picked beers"
           }
        ],
        "type":"message",
        "subtype":"bot_message",
        "ts":"1469129988.000084"
     },
     "response_url":"https://hooks.slack.com/actions/TXXXXXXXX/111111111111/txxxxxxxxxxxxxxxxxxxx"
  }
```

## Slapp.command(command:string, criteria:string|RegExp, callback:function)

  Register a new slash command handler
  
#### Parameters
  - `command` string - the slash command (e.g. "/doit")
  - `criteria` string or RegExp (e.g "/^create.+$/") [optional]
  - `callback` function - `(msg) => {}`
  
  
#### Returns
  - `this` (chainable)
  
  Example without parameters:
  
```js
  // "/acommand"
  slapp.command('acommand', (msg) => {
  }
```

  
  
  Example with RegExp matcher criteria:
  
```js
  // "/acommand create flipper"
  slapp.command('acommand', 'create (.*)'(msg, text, name) => {
    // text = 'create flipper'
    // name = 'flipper'
  }
```

  
  
  Example `msg` object:
  
```js
  {
     "type":"command",
     "body":{
        "token":"xxxxxxxxxxxxxxxxxxx",
        "team_id":"TXXXXXXXX",
        "team_domain":"teamxxxxxxx",
        "channel_id":"Dxxxxxxxx",
        "channel_name":"directmessage",
        "user_id":"Uxxxxxxxx",
        "user_name":"xxxx.xxxxxxxx",
        "command":"/doit",
        "text":"whatever was typed after command",
        "response_url":"https://hooks.slack.com/commands/TXXXXXXXX/111111111111111111111111111"
     },
     "resource":{
        "app_token":"xoxp-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX",
        "app_user_id":"UXXXXXXXX",
        "bot_token":"xoxb-XXXXXXXXXX-XXXXXXXXXXXXXXXXXXXX",
        "bot_user_id":"UXXXXXXXX"
     },
     "meta":{
        "user_id":"UXXXXXXXX",
        "channel_id":"DXXXXXXXX",
        "team_id":"TXXXXXXXX"
     },
  }
```



# Message


A Message object is created for every incoming Slack event, slash command, and interactive message action.
It is generally always passed as `msg`.

`msg` has three main top level properties
- `type` - one of `event`, `command`, `action`
- `body` - the unmodified payload of the original event
- `meta` - derived or normalized properties and anything appended by middleware.

`meta` should at least have these properties
- `app_token` - token for the user for the app
- `app_user_id` - userID for the user who install ed the app
- `bot_token` - token for a bot user of the app
- `bot_user_id` -  userID of the bot user of the app
    

  - [Message.constructor()](#messageconstructortypestringbodyobjectmetaobject)
  - [Message.route()](#messageroutefnkeystringstateobjectsecondstoexpirenumber)
  - [Message.cancel()](#messagecancel)
  - [Message.say()](#messagesayinputstringobjectarraycallbackfunction)
  - [Message.respond()](#messagerespondresponseurlstringinputstringobjectarraycallbackfunction)
  - [Message.thread()](#messagethread)
  - [Message.unthread()](#messageunthread)
  - [Message._request()](#message_request)
  - [Message.isBot()](#messageisbot)
  - [Message.isBaseMessage()](#messageisbasemessage)
  - [Message.isThreaded()](#messageisthreaded)
  - [Message.isDirectMention()](#messageisdirectmention)
  - [Message.isDirectMessage()](#messageisdirectmessage)
  - [Message.isMention()](#messageismention)
  - [Message.isAmbient()](#messageisambient)
  - [Message.isAnyOf()](#messageisanyofofarray)
  - [Message.isAuthedTeam()](#messageisauthedteam)
  - [Message.usersMentioned()](#messageusersmentioned)
  - [Message.channelsMentioned()](#messagechannelsmentioned)
  - [Message.subteamGroupsMentioned()](#messagesubteamgroupsmentioned)
  - [Message.everyoneMentioned()](#messageeveryonementioned)
  - [Message.channelMentioned()](#messagechannelmentioned)
  - [Message.hereMentioned()](#messageherementioned)
  - [Message.linksMentioned()](#messagelinksmentioned)
  - [Message.stripDirectMention()](#messagestripdirectmention)

## Message.constructor(type:string, body:Object, meta:Object)

  Construct a new Message
  
#### Parameters
  - `type` the type of message (event, command, action, etc.)

## Message.route(fnKey:string, state:Object, secondsToExpire:number)

  Register the next function to route to in a conversation.
  
  The route should be registered already through `slapp.route`
  
#### Parameters
  - `fnKey` `string`
  - `state` `object` arbitrary data to be passed back to your function [optional]
  - `secondsToExpire` `number` - number of seconds to wait for the next message in the conversation before giving up. Default 60 minutes [optional]
  
  
#### Returns
  - `this` (chainable)

## Message.cancel()

  Explicity cancel pending `route` registration.

## Message.say(input:string|Object|Array, callback:function)

  Send a message through [`chat.postmessage`](https://api.slack.com/methods/chat.postMessage).
  
  The current channel and inferred tokens are used as defaults. `input` maybe a
  `string`, `Object` or mixed `Array` of `strings` and `Objects`. If a string,
  the value will be set to `text` of the `chat.postmessage` object. Otherwise pass
  a [`chat.postmessage`](https://api.slack.com/methods/chat.postMessage) `Object`.
  If the current message is part of a thread, the new message will remain
  in the thread. To control if a message is threaded or not you can use the
  `msg.thread()` and `msg.unthread()` functions.
  
  If `input` is an `Array`, a random value in the array will be selected.
  
#### Parameters
  - `input` the payload to send, maybe a string, Object or Array.
  - `callback` (err, data) => {}
  
  
#### Returns
  - `this` (chainable)

## Message.respond([responseUrl]:string, input:string|Object|Array, callback:function)

  Respond to a Slash command or interactive message action with a [`chat.postmessage`](https://api.slack.com/methods/chat.postMessage)
  payload. If `respond` is called within 2500ms of the original request (hard limit is 3000ms, consider 500ms as a buffer), the original
  request will be responded to instead of using the `response_url`. This will keep the action button spinner in sync with an awaiting
  update and is about 25% more responsive when tested.
  
  `input` options are the same as [`say`](#messagesay)
  
#### Parameters
  - `responseUrl` string - URL provided by a Slack interactive message action or slash command [optional]
  - `input` the payload to send, maybe a string, Object or Array.
  - `callback` (err, data) => {}
  
  Example:
  
```js
  // responseUrl implied from body.response_url if this is an action or command
  msg.respond('thanks!', (err) => {})
```

  
```js
  // responseUrl explicitly provided
  msg.respond(responseUrl, 'thanks!', (err) => {})
```

  
```js
  // input provided as object
  msg.respond({ text: 'thanks!' }, (err) => {})
```

  
```js
  // input provided as Array
  msg.respond(['thanks!', 'I :heart: u'], (err) => {})
```

  
  
#### Returns
  - `this` (chainable)

## Message.thread()

  Ensures all subsequent messages created are under a thread of the current message
  
  Example:
  
```js
  // current msg is not part of a thread (i.e. does not have thread_ts set)
  msg.
   .say('This message will not be part of the thread and will be in the channel')
   .thread()
   .say('This message will remain in the thread')
   .say('This will also be in the thread')
```

  
#### Returns
  - `this` (chainable)

## Message.unthread()

  Ensures all subsequent messages created are not part of a thread
  
  Example:
  
```js
  // current msg is part of a thread (i.e. has thread_ts set)
  msg.
   .say('This message will remain in the thread')
   .unthread()
   .say('This message will not be part of the thread and will be in the channel')
   .say('This will also not be part of the thread')
```

  
  
#### Returns
  - `this` (chainable)

## Message._request()

  istanbul ignore next

## Message.isBot()

  Is this from a bot user?
  
#### Returns `bool` true if `this` is a message from a bot user

## Message.isBaseMessage()

  Is this an `event` of type `message` without any [subtype](https://api.slack.com/events/message)?
  
  
#### Returns `bool` true if `this` is a message event type with no subtype

## Message.isThreaded()

  Is this an `event` of type `message` without any [subtype](https://api.slack.com/events/message)?
  
  
#### Returns `bool` true if `this` is an event that is part of a thread

## Message.isDirectMention()

  Is this a message that is a direct mention ("@botusername: hi there", "@botusername goodbye!")
  
  
#### Returns `bool` true if `this` is a direct mention

## Message.isDirectMessage()

  Is this a message in a direct message channel (one on one)
  
  
#### Returns `bool` true if `this` is a direct message

## Message.isMention()

  Is this a message where the bot user mentioned anywhere in the message.
  Only checks for mentions of the bot user and does not consider any other users.
  
  
#### Returns `bool` true if `this` mentions the bot user

## Message.isAmbient()

  Is this a message that's not a direct message or that mentions that bot at
  all (other users could be mentioned)
  
  
#### Returns `bool` true if `this` is an ambient message

## Message.isAnyOf(of:Array)

  Is this a message that matches any one of the filters
  
#### Parameters
  - `messageFilters` Array - any of `direct_message`, `direct_mention`, `mention` and `ambient`
  
  
#### Returns `bool` true if `this` is a message that matches any of the filters

## Message.isAuthedTeam()

  Return true if the event "team_id" is included in the "authed_teams" array.
  In other words, this event originated from a team who has installed your app
  versus a team who is sharing a channel with a team who has installed the app
  but in fact hasn't installed the app into that team explicitly.
  There are some events that do not include an "authed_teams" property. In these
  cases, error on the side of claiming this IS from an authed team.
  
#### Returns an Array of user IDs

## Message.usersMentioned()

  Return the user IDs of any users mentioned in the message
  
#### Returns an Array of user IDs

## Message.channelsMentioned()

  Return the channel IDs of any channels mentioned in the message
  
#### Returns an Array of channel IDs

## Message.subteamGroupsMentioned()

  Return the IDs of any subteams (groups) mentioned in the message
  
#### Returns an Array of subteam IDs

## Message.everyoneMentioned()

  Was "@everyone" mentioned in the message
  
#### Returns `bool` true if `@everyone` was mentioned

## Message.channelMentioned()

  Was the current "@channel" mentioned in the message
  
#### Returns `bool` true if `@channel` was mentioned

## Message.hereMentioned()

  Was the "@here" mentioned in the message
  
#### Returns `bool` true if `@here` was mentioned

## Message.linksMentioned()

  Return the URLs of any links mentioned in the message
  
#### Returns `Array:string` of URLs of links mentioned in the message

## Message.stripDirectMention()

  Strip the direct mention prefix from the message text and return it. The
  original text is not modified
  
  
#### Returns `string` original `text` of message with a direct mention of the bot
  user removed. For example, `@botuser hi` or `@botuser: hi` would produce `hi`.
  `@notbotuser hi` would produce `@notbotuser hi`


# Contributing

We adore contributions. Please include the details of the proposed changes in a Pull Request and ensure `npm test` passes. 👻

### Scripts
- `npm test` - runs linter and tests with coverage
- `npm run unit` - runs unit tests without coverage
- `npm run lint` - just runs JS standard linter
- `npm run coverage` - runs tests with coverage
- `npm run lcov` - runs tests with coverage and output lcov report
- `npm run docs` - regenerates API docs in this README.md

# License
MIT Copyright (c) 2016 Beep Boop, Robots & Pencils

[beepboop]: https://beepboophq.com
