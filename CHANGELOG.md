# Changelog

## v2.3 (2017-04-11)

- Added support for dynamic [Message Menu](https://medium.com/slack-developer-blog/build-an-interactive-slack-app-with-message-menus-1fb2c6298308) options calls through `slapp.options(callback_id)`

## v2.2.1 (2017-02-11)

- Fixed bug where user Ids beginning with `W` were not recognized by `usersMentioned()`

## v2.2.0 (2017-02-09)

- [Allow events without app_token to pass](https://github.com/BeepBoopHQ/slapp/pull/71)

## v2.0.1 (2017-01-20)

- Fixed bug where msg.respond() wasn't returning itself so chaining failed.

## v2.0.0

- Threads support

## v1.4.0

- Auto handle responding to Slash commands or actions if within timeout, otherwise continue to use response_url. #65