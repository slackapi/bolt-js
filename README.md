[![Build Status](https://travis-ci.org/BeepBoopHQ/slackapp-js.svg)](https://travis-ci.org/BeepBoopHQ/slackapp-js)

# slackapp-js
A node.js module for Slack App integrations

# slackapp

[src/slackapp.js:24-487](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/slackapp.js#L24-L487 "Source code on GitHub")

`slackapp` exposes a factory that takes an options object.

        var SlackApp = require('slackapp')
        var slackapp = SlackApp(opts)

**Parameters**

-   `opts` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)**
    -   `opts.app_token` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Slack App token override
    -   `opts.app_user_id` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Slack App User ID (who installed the app)
    -   `opts.bot_token` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Slack App Bot token
    -   `opts.bot_user_id` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Slack App Bot ID
    -   `opts.convo_store` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Implementation of ConversationStore, defaults to memory
    -   `opts.error` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Error handler function `(error) => {}`

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** SlackApp

## use

[src/slackapp.js:124-126](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/slackapp.js#L124-L126 "Source code on GitHub")

Register a new middleware, considered in order of registration

**Parameters**

-   `fn` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** (msg, next) => { }
    -   `fn.msg` **[message](#message)** instance of message
    -   `fn.next` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** next callback

## attachToExpress

[src/slackapp.js:180-182](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/slackapp.js#L180-L182 "Source code on GitHub")

Attach HTTP routes to an [Express](https://expressjs.com/) app and registers the following routes:

-   `POST` `/slack-event`
-   `POST` `/slack-command`
-   `POST` `/slack-action`

**Parameters**

-   `app` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** instance of an express app

## route

[src/slackapp.js:192-194](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/slackapp.js#L192-L194 "Source code on GitHub")

Register a new function route

**Parameters**

-   `fnKey` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** unique function key
-   `fn` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** callback (msg) => {}
    -   `fn.msg` **[message](#message)** instance of message

## getRoute

[src/slackapp.js:202-204](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/slackapp.js#L202-L204 "Source code on GitHub")

Return a registered route

**Parameters**

-   `fnKey` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** unique function key

## match

[src/slackapp.js:225-227](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/slackapp.js#L225-L227 "Source code on GitHub")

Register a custom Match function (fn)

$eturns `true` if there is a match AND you handled the msg.
Return `false` if there is not a match and you pass on the message.

All of the higher level matching convenience functions
generate a match function and call match to register it.

Only one matcher can return true and they are executed in the order they are
defined. Match functions should return as fast as possible because it's important
that they are efficient. However you may do asyncronous tasks within to
your hearts content.

**Parameters**

-   `fn` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** match function `(msg) => { return bool }`
    -   `fn.msg` **[message](#message)** instance of Message

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** was a match found and the message handled (otherwise continue looking)

## message

[src/slackapp.js:264-286](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/slackapp.js#L264-L286 "Source code on GitHub")

Register a new message handler function for the provided criteria. Types should be one or
more of:

-   `direct_message`
-   `direct_mention`
-   `mention`
-   `ambient`
-   default: matches all if none provided

**Parameters**

-   `criteria` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp))** string of a regular expression or RexExp object
-   `callback` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** (msg) => {}
    -   `callback.msg` **[message](#message)** instance of Message
-   `typeFilter`  

**Examples**

```javascript
`msg` object:

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

## event

[src/slackapp.js:318-330](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/slackapp.js#L318-L330 "Source code on GitHub")

Register a new event handler for an actionName

**Parameters**

-   `criteria` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp))** type of event or RegExp for more flexible matching
-   `callback` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** (msg) => {}
    -   `callback.msg` **[message](#message)** instance of Message

**Examples**

```javascript
`msg` object:

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

## action

[src/slackapp.js:407-430](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/slackapp.js#L407-L430 "Source code on GitHub")

Register a new action handler for an actionNameCriteria

**Parameters**

-   `callbackId` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Slack interactive message callback_id
-   `actionNameCriteria` **\[([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp))]** type of action or RegExp for more flexible matching
-   `callback` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** (msg) => {}
    -   `callback.msg` **[message](#message)** instance of Message

**Examples**

```javascript
`msg` object:

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
```

## command

[src/slackapp.js:469-486](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/slackapp.js#L469-L486 "Source code on GitHub")

Register a new slash command handler

**Parameters**

-   `command` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the slash command (e.g. "/doit")
-   `criteria` **\[([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp))]** matching criteria for slash command name (e.g "/^create.\*$/")
-   `callback` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** (msg) => {}
    -   `callback.msg` **[message](#message)** instance of Message

**Examples**

```javascript
`msg` object:

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

# message

[src/message.js:8-340](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L8-L340 "Source code on GitHub")

Message

## route

[src/message.js:45-59](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L45-L59 "Source code on GitHub")

Register the next function to route to in a conversation. The route should
be registered already through `slackapp.route`

**Parameters**

-   `fnKey` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** unique key to register function
-   `state`  
-   `secondsToExpire`  

## cancel

[src/message.js:65-67](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L65-L67 "Source code on GitHub")

Explicity cancel `route` registration.

## say

[src/message.js:83-95](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L83-L95 "Source code on GitHub")

Send a message through `chat.postmessage` that defaults to current channel and tokens

`input` may be one of:

-   type `object`: raw object that would be past to `chat.postmessage`
-   type `string`: text of a message that will be used to construct object sent to `chat.postmessage`
-   type `Array`: of strings or objects above to be picked randomly (can be mixed!)

**Parameters**

-   `input` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))**
-   `callback` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** (err, data) => {}
    -   `callback.err` **[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)** error object
    -   `callback.data` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** data returned from call

## respond

[src/message.js:112-140](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L112-L140 "Source code on GitHub")

Use a `response_url` from a Slash command or interactive message action

`input` may be one of:

-   type `object`: raw object that would be past to `chat.postmessage`
-   type `string`: text of a message that will be used to construct object sent to `chat.postmessage`
-   type `Array`: of strings or objects above to be picked randomly (can be mixed!)

**Parameters**

-   `responseUrl` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** URL provided by a Slack interactive message action or slash command
-   `input` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))**
-   `callback` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** (err, data) => {}
    -   `callback.err` **[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)** error object
    -   `callback.data` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** data returned from call

## isMessage

[src/message.js:146-148](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L146-L148 "Source code on GitHub")

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Is this an `event` of type `message`?

## isDirectMention

[src/message.js:154-156](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L154-L156 "Source code on GitHub")

Is this a message that is a direct mention ("@botusername: hi there", "@botusername goodbye!")

## isDirectMessage

[src/message.js:162-164](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L162-L164 "Source code on GitHub")

Is this a message in a direct message channel (one on one)

## isMention

[src/message.js:171-173](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L171-L173 "Source code on GitHub")

Is this a message where the bot user mentioned anywhere in the message.
This only checks for the bot user and does not consider any other users

## isAmbient

[src/message.js:180-182](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L180-L182 "Source code on GitHub")

Is this a message that's not a direct message or that mentions that bot at
all (other users could be mentioned)

## isAnyOf

[src/message.js:191-202](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L191-L202 "Source code on GitHub")

Is this a message that matches any one of these filter types

Parameters:

-   `messageFilters` Array - any of direct_message, direct_mention, mention or ambient

**Parameters**

-   `messageFilters`  

## usersMentioned

[src/message.js:210-212](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L210-L212 "Source code on GitHub")

Users mentioned in the message

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>** array of user IDs

## channelsMentioned

[src/message.js:220-222](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L220-L222 "Source code on GitHub")

Channels mentioned in the message

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>** array of channel IDs

## subteamGroupsMentioned

[src/message.js:229-231](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L229-L231 "Source code on GitHub")

Subteams (groups) mentioned in the message

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>** array of subteam IDs

## everyoneMentioned

[src/message.js:237-239](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L237-L239 "Source code on GitHub")

Was "@everyone" mentioned in the message

## channelMentioned

[src/message.js:245-247](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L245-L247 "Source code on GitHub")

Was the current "@channel" mentioned in the message

## hereMentioned

[src/message.js:253-255](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L253-L255 "Source code on GitHub")

Was the current "@channel" mentioned in the message

## linksMentioned

[src/message.js:261-276](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L261-L276 "Source code on GitHub")

Return the URLs of any links mentioned in the message

## stripDirectMention

[src/message.js:283-293](https://github.com/BeepBoopHQ/slackapp-js/blob/59256077fb3b9c34ad8e767105d6a80219b260cb/src/message.js#L283-L293 "Source code on GitHub")

Strip the direct mention prefix from the message text and return it. The
original text is not modified
