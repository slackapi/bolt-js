[![Build Status](https://travis-ci.org/BeepBoopHQ/slackapp-js.svg)](https://travis-ci.org/BeepBoopHQ/slackapp-js)

# slackapp-js
A node.js module for Slack App integrations




# API

## undefined

### SlackApp.module.exports

<p>SlackApp module</p>

### SlackApp.constructor()

<p>Initialize a SlackApp, accepts an options object</p><p>Options:</p><ul>
<li><code>app_token</code>   Slack App token</li>
<li><code>app_user_id</code> Slack App User ID (who installed the app)</li>
<li><code>bot_token</code>   Slack App Bot token</li>
<li><code>bot_user_id</code> Slack App Bot ID</li>
<li><code>convo_store</code> <code>string</code> of type of Conversation store (<code>memory</code>, etc.) or <code>object</code> implementation</li>
<li><code>error</code>       Error handler function <code>(error) =&gt; {}</code></li>
</ul>


### SlackApp.init()

<p>Initialize app w/ default middleware and receiver listener</p>

### SlackApp.preprocessConversationMiddleware()

<p>Middleware that gets an existing conversation from the conversation store<br />or initialize a new one.</p>

### SlackApp.ignoreBotsMiddleware()

<p>Middleware that ignores messages from any bot user when we can tell</p>

### SlackApp.use()

<p>Register a new middleware</p><p>Middleware is processed in the order registered.<br /><code>fn</code> : (msg, next) =&gt; { }</p>

### SlackApp._handle()

<p>Handle new events (slack events, commands, actions, webhooks, etc.)</p>

### SlackApp.attachToExpress()

<p>Attach HTTP routes to an Express app</p><p>Routes are:</p><ul>
<li>POST <code>/slack-event</code></li>
<li>POST <code>/slack-command</code></li>
<li>POST <code>/slack-action</code></li>
</ul>


### SlackApp.route()

<p>Register a new function route</p><p>Parameters</p><ul>
<li><code>fnKey</code> string - unique key to refer to function</li>
<li><code>fn</code>  function - <code>(msg) =&gt; {}</code></li>
</ul>


### SlackApp.getRoute()

<p>Return a registered route</p><p>Parameters</p><ul>
<li><code>fnKey</code> string - unique key to refer to function</li>
</ul>


### SlackApp.match()

<p>Register a custom Match function (fn)</p><p>$eturns <code>true</code> if there is a match AND you handled the msg.<br />Return <code>false</code> if there is not a match and you pass on the message.</p><p>All of the higher level matching convenience functions<br />generate a match function and call match to register it.</p><p>Only one matcher can return true and they are executed in the order they are<br />defined. Match functions should return as fast as possible because it&#39;s important<br />that they are efficient. However you may do asyncronous tasks within to<br />your hearts content.</p><p>Parameters</p><ul>
<li><code>fn</code> function - match function <code>(msg) =&gt; { return bool }</code></li>
</ul>


### SlackApp.message()

<p>Register a new message handler function for the criteria</p><p>Parameters:</p><ul>
<li><code>criteria</code> string or RegExp - message is string or match RegExp</li>
<li><code>typeFilter</code> Array for list of values or string for one value [optional]<ul>
<li><code>direct_message</code></li>
<li><code>direct_mention</code></li>
<li><code>mention</code></li>
<li><code>ambient</code></li>
<li>default: matches all if none provided</li>
</ul>
</li>
<li><code>callback</code> function - <code>(msg) =&gt; {}</code></li>
</ul>
<p>Example <code>msg</code> object:</p><p>   {<br />      &quot;token&quot;:&quot;dxxxxxxxxxxxxxxxxxxxx&quot;,<br />      &quot;team_id&quot;:&quot;TXXXXXXXX&quot;,<br />      &quot;api_app_id&quot;:&quot;AXXXXXXXX&quot;,<br />      &quot;event&quot;:{<br />         &quot;type&quot;:&quot;message&quot;,<br />         &quot;user&quot;:&quot;UXXXXXXXX&quot;,<br />         &quot;text&quot;:&quot;hello!&quot;,<br />         &quot;ts&quot;:&quot;1469130107.000088&quot;,<br />         &quot;channel&quot;:&quot;DXXXXXXXX&quot;<br />      },<br />      &quot;event_ts&quot;:&quot;1469130107.000088&quot;,<br />      &quot;type&quot;:&quot;event_callback&quot;,<br />      &quot;authed_users&quot;:[<br />         &quot;UXXXXXXXX&quot;<br />      ]<br />   }</p>

### SlackApp.event()

<p>Register a new event handler for an actionName</p><p>Parameters:</p><ul>
<li><code>criteria</code> string or RegExp - the type of event</li>
<li><code>callback</code> function - <code>(msg) =&gt; {}</code></li>
</ul>
<p>Example <code>msg</code> object:</p><p>   {<br />      &quot;token&quot;:&quot;dxxxxxxxxxxxxxxxxxxxx&quot;,<br />      &quot;team_id&quot;:&quot;TXXXXXXXX&quot;,<br />      &quot;api_app_id&quot;:&quot;AXXXXXXXX&quot;,<br />      &quot;event&quot;:{<br />         &quot;type&quot;:&quot;reaction_added&quot;,<br />         &quot;user&quot;:&quot;UXXXXXXXX&quot;,<br />         &quot;item&quot;:{<br />            &quot;type&quot;:&quot;message&quot;,<br />            &quot;channel&quot;:&quot;DXXXXXXXX&quot;,<br />            &quot;ts&quot;:&quot;1469130181.000096&quot;<br />         },<br />         &quot;reaction&quot;:&quot;grinning&quot;<br />      },<br />      &quot;event_ts&quot;:&quot;1469131201.822817&quot;,<br />      &quot;type&quot;:&quot;event_callback&quot;,<br />      &quot;authed_users&quot;:[<br />         &quot;UXXXXXXXX&quot;<br />      ]<br />   }</p>

### SlackApp.action()

<p>Register a new action handler for an actionNameCriteria</p><p>Parameters:</p><ul>
<li><code>callbackId</code> string</li>
<li><code>actionNameCriteria</code> string or RegExp - the name of the action [optional]</li>
<li><code>callback</code> function - <code>(msg) =&gt; {}</code></li>
</ul>
<p>Example <code>msg</code> object:</p><p>{<br />   &quot;actions&quot;:[<br />      {<br />         &quot;name&quot;:&quot;answer&quot;,<br />         &quot;value&quot;:&quot;:wine_glass:&quot;<br />      }<br />   ],<br />   &quot;callback_id&quot;:&quot;in_or_out_callback&quot;,<br />   &quot;team&quot;:{<br />      &quot;id&quot;:&quot;TXXXXXXXX&quot;,<br />      &quot;domain&quot;:&quot;companydomain&quot;<br />   },<br />   &quot;channel&quot;:{<br />      &quot;id&quot;:&quot;DXXXXXXXX&quot;,<br />      &quot;name&quot;:&quot;directmessage&quot;<br />   },<br />   &quot;user&quot;:{<br />      &quot;id&quot;:&quot;UXXXXXXXX&quot;,<br />      &quot;name&quot;:&quot;mike.brevoort&quot;<br />   },<br />   &quot;action_ts&quot;:&quot;1469129995.067370&quot;,<br />   &quot;message_ts&quot;:&quot;1469129988.000084&quot;,<br />   &quot;attachment_id&quot;:&quot;1&quot;,<br />   &quot;token&quot;:&quot;dxxxxxxxxxxxxxxxxxxxx&quot;,<br />   &quot;original_message&quot;:{<br />      &quot;text&quot;:&quot;What?&quot;,<br />      &quot;username&quot;:&quot;In or Out&quot;,<br />      &quot;bot_id&quot;:&quot;BXXXXXXXX&quot;,<br />      &quot;attachments&quot;:[<br />         {<br />            &quot;callback_id&quot;:&quot;in_or_out_callback&quot;,<br />            &quot;fallback&quot;:&quot;Pick one&quot;,<br />            &quot;id&quot;:1,<br />            &quot;actions&quot;:[<br />               {<br />                  &quot;id&quot;:&quot;1&quot;,<br />                  &quot;name&quot;:&quot;answer&quot;,<br />                  &quot;text&quot;:&quot;:beer:&quot;,<br />                  &quot;type&quot;:&quot;button&quot;,<br />                  &quot;value&quot;:&quot;:beer:&quot;,<br />                  &quot;style&quot;:&quot;&quot;<br />               },<br />               {<br />                  &quot;id&quot;:&quot;2&quot;,<br />                  &quot;name&quot;:&quot;answer&quot;,<br />                  &quot;text&quot;:&quot;:beers:&quot;,<br />                  &quot;type&quot;:&quot;button&quot;,<br />                  &quot;value&quot;:&quot;:wine:&quot;,<br />                  &quot;style&quot;:&quot;&quot;<br />               },<br />            ]<br />         },<br />         {<br />            &quot;text&quot;:&quot;:beers: • mike.brevoort&quot;,<br />            &quot;id&quot;:2,<br />            &quot;fallback&quot;:&quot;who picked beers&quot;<br />         }<br />      ],<br />      &quot;type&quot;:&quot;message&quot;,<br />      &quot;subtype&quot;:&quot;bot_message&quot;,<br />      &quot;ts&quot;:&quot;1469129988.000084&quot;<br />   },<br />   &quot;response_url&quot;:&quot;<a href="https://hooks.slack.com/actions/TXXXXXXXX/111111111111/txxxxxxxxxxxxxxxxxxxx">https://hooks.slack.com/actions/TXXXXXXXX/111111111111/txxxxxxxxxxxxxxxxxxxx</a>&quot;</p>

### SlackApp.command()

<p>Register a new slash command handler</p><p>Parameters:</p><ul>
<li><code>command</code> string - the slash command (e.g. &quot;/doit&quot;)</li>
<li><code>criteria</code> string or RegExp (e.g &quot;/^create.*$/&quot;) [optional]</li>
<li><code>callback</code> function - <code>(msg) =&gt; {}</code></li>
</ul>
<p>Example <code>msg</code> object:</p><pre><code>{
   &quot;type&quot;:&quot;command&quot;,
   &quot;body&quot;:{
      &quot;token&quot;:&quot;xxxxxxxxxxxxxxxxxxx&quot;,
      &quot;team_id&quot;:&quot;TXXXXXXXX&quot;,
      &quot;team_domain&quot;:&quot;teamxxxxxxx&quot;,
      &quot;channel_id&quot;:&quot;Dxxxxxxxx&quot;,
      &quot;channel_name&quot;:&quot;directmessage&quot;,
      &quot;user_id&quot;:&quot;Uxxxxxxxx&quot;,
      &quot;user_name&quot;:&quot;xxxx.xxxxxxxx&quot;,
      &quot;command&quot;:&quot;/doit&quot;,
      &quot;text&quot;:&quot;whatever was typed after command&quot;,
      &quot;response_url&quot;:&quot;https://hooks.slack.com/commands/TXXXXXXXX/111111111111111111111111111&quot;
   },
   &quot;resource&quot;:{
      &quot;app_token&quot;:&quot;xoxp-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX&quot;,
      &quot;app_user_id&quot;:&quot;UXXXXXXXX&quot;,
      &quot;bot_token&quot;:&quot;xoxb-XXXXXXXXXX-XXXXXXXXXXXXXXXXXXXX&quot;,
      &quot;bot_user_id&quot;:&quot;UXXXXXXXX&quot;
   },
   &quot;meta&quot;:{
      &quot;user_id&quot;:&quot;UXXXXXXXX&quot;,
      &quot;channel_id&quot;:&quot;DXXXXXXXX&quot;,
      &quot;team_id&quot;:&quot;TXXXXXXXX&quot;
   },
}
</code></pre>

## undefined

### Message.module.exports

<p>Message</p>

### Message.route()

<p>Register the next function to route to in a conversation. The route should<br />be registered already through <code>slackapp.route</code></p>

### Message.cancel()

<p>Explicity cancel <code>route</code> registration.</p>

### Message.say()

<p>Send a message through <code>chat.postmessage</code> that defaults to current channel and tokens</p><p><code>input</code> may be one of:</p><ul>
<li>type <code>object</code>: raw object that would be past to <code>chat.postmessage</code></li>
<li>type <code>string</code>: text of a message that will be used to construct object sent to <code>chat.postmessage</code></li>
<li>type <code>Array</code>: of strings or objects above to be picked randomly (can be mixed!)</li>
</ul>


### Message.respond()

<p>Use a <code>response_url</code> from a Slash command or interactive message action</p><p><code>input</code> may be one of:</p><ul>
<li>type <code>object</code>: raw object that would be past to <code>chat.postmessage</code></li>
<li>type <code>string</code>: text of a message that will be used to construct object sent to <code>chat.postmessage</code></li>
<li>type <code>Array</code>: of strings or objects above to be picked randomly (can be mixed!)</li>
</ul>


### Message.isMessage()



### Message.isDirectMention()

<p>Is this a message that is a direct mention (&quot;@botusername: hi there&quot;, &quot;@botusername goodbye!&quot;)</p>

### Message.isDirectMessage()

<p>Is this a message in a direct message channel (one on one)</p>

### Message.isMention()

<p>Is this a message where the bot user mentioned anywhere in the message.<br />This only checks for the bot user and does not consider any other users</p>

### Message.isAmbient()

<p>Is this a message that&#39;s not a direct message or that mentions that bot at<br />all (other users could be mentioned)</p>

### Message.isAnyOf()

<p>Is this a message that matches any one of these filter types</p><p>Parameters:</p><ul>
<li><code>messageFilters</code> Array - any of direct_message, direct_mention, mention or ambient</li>
</ul>


### Message.usersMentioned()

<p>Users mentioned in the message</p>

### Message.channelsMentioned()

<p>Channels mentioned in the message</p>

### Message.subteamGroupsMentioned()

<p>Subteams (groups) mentioned in the message</p>

### Message.everyoneMentioned()

<p>Was &quot;@everyone&quot; mentioned in the message</p>

### Message.channelMentioned()

<p>Was the current &quot;@channel&quot; mentioned in the message</p>

### Message.hereMentioned()

<p>Was the current &quot;@channel&quot; mentioned in the message</p>

### Message.linksMentioned()

<p>Return the URLs of any links mentioned in the message</p>

### Message.stripDirectMention()

<p>Strip the direct mention prefix from the message text and return it. The<br />original text is not modified</p>

### Message._regexMentions()

<p>Returns array of regex matches from the text of a message</p>

### Message._processInput()

<p>Preprocess <code>chat.postmessage</code> input.</p><p>If an array, pick a random item of the array.<br />If a string, wrap in a <code>chat.postmessage</code> params object</p>

# Contributing


# License
