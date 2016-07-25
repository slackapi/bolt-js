[![Build Status](https://travis-ci.org/BeepBoopHQ/slackapp-js.svg)](https://travis-ci.org/BeepBoopHQ/slackapp-js)
[![Coverage Status](https://coveralls.io/repos/github/BeepBoopHQ/slackapp-js/badge.svg)](https://coveralls.io/github/BeepBoopHQ/slackapp-js)

# slackapp-js
A node.js module for Slack App integrations

# API

# slackapp

  - [slackapp()](#slackappoptsobject)

## slackapp(opts:Object)

  Create a new SlackApp, accepts an options object
  
  Parameters
  - `opts.app_token`   Slack App token override
  - `opts.app_user_id` Slack App User ID (who installed the app)
  - `opts.bot_token`   Slack App Bot token
  - `opts.bot_user_id` Slack App Bot ID
  - `opts.convo_store` Implementation of ConversationStore, defaults to memory
  - `opts.error`       Error handler function `(error) => {}`
  
  Example
  
  
```js
  var SlackApp = require('slackapp')
  var BeepBoopConvoStore = require('slackapp-convo-beepboop')
  var slackapp = SlackApp({
    debug: true,
    record: 'out.jsonl',
    convo_store: BeepBoopConvoStore({ debug: true }),
    error: (err) => { console.error('Error: ', err) }
  })
```



# SlackApp

  - [SlackApp.use()](#slackappusefnfunction)
  - [SlackApp.attachToExpress()](#slackappattachtoexpressappobject)
  - [SlackApp.route()](#slackapproutefnkeystringfnfunction)
  - [SlackApp.getRoute()](#slackappgetroutefnkeystring)
  - [SlackApp.match()](#slackappmatchfnfunction)
  - [SlackApp.message()](#slackappmessagecriteriastringtypefilterstringarray)
  - [SlackApp.event()](#slackappeventcriteriastringregexpcallbackfunction)
  - [SlackApp.action()](#slackappactioncallbackidstringactionnamecriteriastringregexpcallbackfunction)
  - [SlackApp.command()](#slackappcommandcommandstringcriteriastringregexpcallbackfunction)

## SlackApp.use(fn:function)

  Register a new middleware, processed in the order registered.
  
#### Parameters
  - `fn`: middleware function `(msg, next) => { }`
  
  
#### Returns
  - `this` (chainable)

## SlackApp.attachToExpress(app:Object)

  Attach HTTP routes to an Express app
  
  Routes are:
  - POST `/slackapp/event`
  - POST `/slackapp/command`
  - POST `/slackapp/action`
  
#### Parameters
  - `app` instance of Express app
  
  
#### Returns
  - `app` reference to Express app passed in

## SlackApp.route(fnKey:string, fn:function)

  Register a new function route
  
#### Parameters
  - `fnKey` unique key to refer to function
  - `fn` `(msg, state) => {}`
  
  
#### Returns
  - `this` (chainable)

## SlackApp.getRoute(fnKey:string)

  Return a registered route
  
#### Parameters
  - `fnKey` string - unique key to refer to function
  
  
#### Returns
  - `(msg, state) => {}`

## SlackApp.match(fn:function)

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

## SlackApp.message(criteria:string, typeFilter:string|Array)

  Register a new message handler function for the criteria
  
#### Parameters
  - `criteria` text that message contains or regex (e.g. "^hi")
  - `typeFilter` [optional] Array for multiple values or string for one value. Valid values are `direct_message`, `direct_mention`, `mention`, `ambient`
  - `callback` function - `(msg) => {}`
  
  
#### Returns
  - `this` (chainable)
  
  
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

## SlackApp.event(criteria:string|RegExp, callback:function)

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

## SlackApp.action(callbackId:string, actionNameCriteria:string|RegExp, callback:function)

  Register a new action handler for an actionNameCriteria
  
#### Parameters
  - `callbackId` string
  - `actionNameCriteria` string or RegExp - the name of the action [optional]
  - `callback` function - `(msg) => {}`
  
  
#### Returns
  - `this` (chainable)
  
  
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

## SlackApp.command(command:string, criteria:string|RegExp, callback:function)

  Register a new slash command handler
  
#### Parameters
  - `command` string - the slash command (e.g. "/doit")
  - `criteria` string or RegExp (e.g "/^create.+$/") [optional]
  - `callback` function - `(msg) => {}`
  
  
#### Returns
  - `this` (chainable)
  
  
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
  - [Message.isMessage()](#messageismessage)
  - [Message.isDirectMention()](#messageisdirectmention)
  - [Message.isDirectMessage()](#messageisdirectmessage)
  - [Message.isMention()](#messageismention)
  - [Message.isAmbient()](#messageisambient)
  - [Message.isAnyOf()](#messageisanyofofarray)
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
  
  The route should be registered already through `slackapp.route`
  
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
  
  If `input` is an `Array`, a random value in the array will be selected.
  
#### Parameters
  - `input` the payload to send, maybe a string, Object or Array.
  - `callback` (err, data) => {}
  
  
#### Returns
  - `this` (chainable)

## Message.respond(responseUrl:string, input:string|Object|Array, callback:function)

  Use a `response_url` from a Slash command or interactive message action with
  a [`chat.postmessage`](https://api.slack.com/methods/chat.postMessage) payload.
  `input` options are the same as [`say`](#messagesay)
  
#### Parameters
  - `responseUrl` string - URL provided by a Slack interactive message action or slash command
  - `input` the payload to send, maybe a string, Object or Array.
  - `callback` (err, data) => {}
  
  
#### Returns
  - `this` (chainable)

## Message.isMessage()

  Is this an `event` of type `message`?
  
  
#### Returns `bool` true if `this` is a message event type

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

We adore contributions. Please include the details of the proposed changes in a Pull Request and ensure `npm test` pass. 👻

### Scripts
- `npm test` - runs linter and tests with coverage
- `npm run unit` - runs unit tests without coverage
- `npm run lint` - just runs JS standard linter
- `npm run coverage` - runs tests with coverage
- `npm run lcov` - runs tests with coverage and output lcov report
- `npm run docs` - regenerates API docs in this README.md

# License
MIT Copyright (c) 2016 Beep Boop, Robots & Pencils
