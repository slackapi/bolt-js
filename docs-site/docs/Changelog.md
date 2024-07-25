---
hide_table_of_contents: true
---

# Changelog

<a name="@slack/bolt@3.19.0"></a>
# [@slack/bolt@3.19.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.19.0) - 19 Jun 2024

## What's Changed

More customizations for the `AwsLambdaReceiver` have landed as well as a few touchups to typings and documented details! 

With this release, the signature verification for `AwsLambdaReceiver` can now be turned off if that's something you're interested in! Perhaps you have your own stylish way of verifying these signatures. The following can be added to your receiver to unlock this:

```ts
const { App, AwsLambdaReceiver } = require('@slack/bolt');

const app = new App({
  ...
  receiver: new AwsLambdaReceiver({
    signatureVerification: false,
  }),
});
```

Read on and browse around for more details on all of the changes included!

### 🎁 Enhancements

* Add flag to `AwsLambdaReceiver` to enable/disable signature verification in https://github.com/slackapi/bolt-js/pull/2107 - thanks [@noah-guillory](https://github.com/noah-guillory)!

### 🐛 Fixes

* Add a type predicate for `CodedError` in https://github.com/slackapi/bolt-js/pull/2110 - thanks [@filmaj](https://github.com/filmaj)!
* ButtonAction value field not required in https://github.com/slackapi/bolt-js/pull/2134 - thanks [@srajiang](https://github.com/srajiang)!
* fix(types): return void promises from the express receiver middleware parser in https://github.com/slackapi/bolt-js/pull/2141 - thanks [@zimeg](https://github.com/zimeg)!

### 📚 Documentation

* docs: fixed duplicative header links in reference in https://github.com/slackapi/bolt-js/pull/2120 - thanks [@lukegalbraithrussell](https://github.com/lukegalbraithrussell)!
* docs: deprecate Steps from Apps docs in https://github.com/slackapi/bolt-js/pull/2130 - thanks [@filmaj](https://github.com/filmaj)!
* docs: add JSDoc to and list out all available builtin middleware functions in the docs in https://github.com/slackapi/bolt-js/pull/2136 - thanks [@filmaj](https://github.com/filmaj)!

### 🧰 Maintenance

* ci(test): perform unit testing against node version 22 in https://github.com/slackapi/bolt-js/pull/2140 - thanks [@zimeg](https://github.com/zimeg)!
* chore(release): tag version @slack/bolt@3.19.0 in https://github.com/slackapi/bolt-js/pull/2142 - thanks [@zimeg](https://github.com/zimeg)!

### 📦 Dependencies

* Bump @types/node from 20.12.7 to 20.12.10 in https://github.com/slackapi/bolt-js/pull/2111 - thanks [@dependabot](https://github.com/dependabot)!
* Bump @types/node from 20.12.10 to 20.12.11 in https://github.com/slackapi/bolt-js/pull/2114 - thanks [@dependabot](https://github.com/dependabot)!
* Bump @types/node from 20.12.11 to 20.12.12 in https://github.com/slackapi/bolt-js/pull/2117 - thanks [@dependabot](https://github.com/dependabot)!
* Bump @types/node from 20.12.12 to 20.14.0 in https://github.com/slackapi/bolt-js/pull/2125 - thanks [@dependabot](https://github.com/dependabot)!
* Bump @types/node from 20.14.0 to 20.14.2 in https://github.com/slackapi/bolt-js/pull/2132 - thanks [@dependabot](https://github.com/dependabot)!

## New Contributors

* [@noah-guillory](https://github.com/noah-guillory) made their first contribution in https://github.com/slackapi/bolt-js/pull/2107
* [@lukegalbraithrussell](https://github.com/lukegalbraithrussell) made their first contribution in https://github.com/slackapi/bolt-js/pull/2120

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.18.0...@slack/bolt@3.19.0

[Changes][@slack/bolt@3.19.0]

<a name="@slack/bolt@3.18.0"></a>
# [@slack/bolt@3.18.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.18.0) - 25 Apr 2024

## What's Changed
* Fix [#2056](https://github.com/slackapi/bolt-js/issues/2056) by adding `files` to `app_mention` event payload by [@seratch](https://github.com/seratch) in https://github.com/slackapi/bolt-js/pull/2057
* Update acknowledging_requests.md by [@technically-tracy](https://github.com/technically-tracy) in https://github.com/slackapi/bolt-js/pull/2086

## New Contributors
* [@technically-tracy](https://github.com/technically-tracy) made their first contribution in https://github.com/slackapi/bolt-js/pull/2086

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.17.1...@slack/bolt@3.18.0

[Changes][@slack/bolt@3.18.0]


<a name="@slack/bolt@3.17.1"></a>
# [@slack/bolt@3.17.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.17.1) - 11 Jan 2024

## What's Changed
* chore(3.17.1): Publish v3.17.1 by [@rafael-fecha](https://github.com/rafael-fecha), including dependency updates to address an Axios security vulnerability in https://github.com/slackapi/bolt-js/pull/2029

## New Contributors
* [@rafael-fecha](https://github.com/rafael-fecha) made their first contribution in https://github.com/slackapi/bolt-js/pull/2029

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.17.0...@slack/bolt@3.17.1

[Changes][@slack/bolt@3.17.1]


<a name="@slack/bolt@3.17.0"></a>
# [@slack/bolt@3.17.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.17.0) - 20 Dec 2023

## What's Changed

* Support for `style.code` properties on rich text elements (updates `@slack/types` to 2.11 and `@slack/web-api` to 6.11) by [@filmaj](https://github.com/filmaj) in https://github.com/slackapi/bolt-js/pull/2017

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.16.0...@slack/bolt@3.17.0

[Changes][@slack/bolt@3.17.0]


<a name="@slack/bolt@3.16.0"></a>
# [@slack/bolt@3.16.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.16.0) - 01 Dec 2023

## What's Changed

### Enhancements 🎁 
* Close HTTP response on unhandled request timeout - Thank you [@suhailgupta03](https://github.com/suhailgupta03) in https://github.com/slackapi/bolt-js/pull/2007
* Prevent sending response headers if already sent in default error han… - Thanks! [@suhailgupta03](https://github.com/suhailgupta03) in https://github.com/slackapi/bolt-js/pull/2006

### Maintainers
* Complete every matrix test regardless of adjacent failures - Thank you [@zimeg](https://github.com/zimeg) in https://github.com/slackapi/bolt-js/pull/2004
* Bump @types/node from 20.9.0 to 20.9.2 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/2000
* Bump @types/node from 20.9.2 to 20.10.0 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/2003

## New Contributors 👋 
* [@suhailgupta03](https://github.com/suhailgupta03) made their first contribution in https://github.com/slackapi/bolt-js/pull/2006 🎉 

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.15.0...@slack/bolt@3.16.0

[Changes][@slack/bolt@3.16.0]


<a name="@slack/bolt@3.15.0"></a>
# [@slack/bolt@3.15.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.15.0) - 15 Nov 2023

## What's Changed

This minor release includes support for the new [File Input Block Kit Element](https://api.slack.com/reference/block-kit/block-elements#file_input), which allows for users to submit files using Block Kit. It also removes all traces of vulnerable versions of the `axios` dependency.

### Enhancements

* Add `file_input` block element payload support in TS by [@seratch](https://github.com/seratch) in https://github.com/slackapi/bolt-js/pull/1995
* Add `rich_text_input` block element payload support in TS by [@seratch](https://github.com/seratch) in https://github.com/slackapi/bolt-js/pull/1963
* Allow a custom `SocketModeReceiver` to be used with Socket Mode by [@zimeg](https://github.com/zimeg) in https://github.com/slackapi/bolt-js/pull/1972
* Include an example of using middleware with the `ExpressReceiver` by [@zimeg](https://github.com/zimeg) in https://github.com/slackapi/bolt-js/pull/1973

### Bug Fixes

* fix: options constraint has wrong type definition by [@nemanjastanic](https://github.com/nemanjastanic) in https://github.com/slackapi/bolt-js/pull/1940

### Dependencies

* Bump @types/node from 20.6.2 to 20.9.0
* Upgrade axios by [@wannfq](https://github.com/wannfq) in https://github.com/slackapi/bolt-js/pull/1986
* Update mocha and web-api dependencies by [@filmaj](https://github.com/filmaj) in https://github.com/slackapi/bolt-js/pull/1994

### Other

* Remove beta documentation by [@zimeg](https://github.com/zimeg) in https://github.com/slackapi/bolt-js/pull/1961
* Fix link in docs by [@mkly](https://github.com/mkly) in https://github.com/slackapi/bolt-js/pull/1992

## New Contributors
* [@nemanjastanic](https://github.com/nemanjastanic) made their first contribution in https://github.com/slackapi/bolt-js/pull/1940
* [@wannfq](https://github.com/wannfq) made their first contribution in https://github.com/slackapi/bolt-js/pull/1986
* [@mkly](https://github.com/mkly) made their first contribution in https://github.com/slackapi/bolt-js/pull/1992

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.14.0...@slack/bolt@3.15.0

[Changes][@slack/bolt@3.15.0]


<a name="@slack/bolt@3.14.0"></a>
# [@slack/bolt@3.14.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.14.0) - 21 Sep 2023

## What's Changed

### Important Notice

Since this version, we've dropped Node 16 support as [the version is EOLed on September 11th, 2023](https://nodejs.org/en/blog/announcements/nodejs16-eol). Please upgrade to a newer Node.js version from now on.

### Enhancements

* Add typings for timepicker by [@YussufElarif](https://github.com/YussufElarif) in https://github.com/slackapi/bolt-js/pull/1928
* Upload code coverage reports using the Codecov GitHub Action by [@zimeg](https://github.com/zimeg) in https://github.com/slackapi/bolt-js/pull/1937
* Expose useful functions by [@WilliamBergamin](https://github.com/WilliamBergamin) in https://github.com/slackapi/bolt-js/pull/1955

### Bug Fixes

* Update ci-build.yml - add codecov upload token by [@srajiang](https://github.com/srajiang) in https://github.com/slackapi/bolt-js/pull/1952

### Dependencies

* Bump @types/node from 20.4.5 to 20.4.8 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1922
* Bump @types/node from 20.4.8 to 20.5.0 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1923
* Bump @types/node from 20.5.0 to 20.5.1 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1929
* Bump @types/node from 20.5.1 to 20.5.7 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1934
* Bump @slack/logger from 3.0.0 to 4.0.0 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1935
* Bump @types/node from 20.5.7 to 20.5.9 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1938
* Bump @types/node from 20.5.9 to 20.6.0 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1945
* Bump @types/node from 20.6.0 to 20.6.2 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1951
* Release: @slack/bolt@3.14.0 by [@WilliamBergamin](https://github.com/WilliamBergamin) in https://github.com/slackapi/bolt-js/pull/1956


## New Contributors
* [@YussufElarif](https://github.com/YussufElarif) made their first contribution in https://github.com/slackapi/bolt-js/pull/1928

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.13.3...@slack/bolt@3.14.0

[Changes][@slack/bolt@3.14.0]


<a name="@slack/bolt@3.13.3"></a>
# [@slack/bolt@3.13.3](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.13.3) - 04 Aug 2023

## What's Changed
* Add missing user object member to type BlockAction by [@GovernmentHack](https://github.com/GovernmentHack) in https://github.com/slackapi/bolt-js/pull/1910
* Fix socket mode exception when using node v20 by [@WilliamBergamin](https://github.com/WilliamBergamin) in https://github.com/slackapi/bolt-js/pull/1918

## New Contributors
* [@GovernmentHack](https://github.com/GovernmentHack) made their first contribution in https://github.com/slackapi/bolt-js/pull/1910

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.13.2...@slack/bolt@3.13.3

[Changes][@slack/bolt@3.13.3]


<a name="@slack/bolt@3.13.2"></a>
# [@slack/bolt@3.13.2](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.13.2) - 13 Jul 2023

## What's Changed

### Enhancements

* Expose user ID in context in https://github.com/slackapi/bolt-js/pull/1853 – thanks [@gilmatok](https://github.com/gilmatok)!
* Move node version to devDependencies in https://github.com/slackapi/bolt-js/pull/1894 – thanks [@WilliamBergamin](https://github.com/WilliamBergamin)!

### Bug fixes

* Fix [#1819](https://github.com/slackapi/bolt-js/issues/1819) Add metadata to response_url params in https://github.com/slackapi/bolt-js/pull/1821 – thanks [@seratch](https://github.com/seratch)!
* Simplify reaction_added/removed event's item type in https://github.com/slackapi/bolt-js/pull/1845 – thanks [@seratch](https://github.com/seratch)!
* Fix [#1512](https://github.com/slackapi/bolt-js/issues/1512) Remove say from SlackShortcutMiddlewareArgs for GlobalShortcuts in https://github.com/slackapi/bolt-js/pull/1849 – thanks [@mlauter](https://github.com/mlauter)!
* Fix [#1889](https://github.com/slackapi/bolt-js/issues/1889) Add missing user type in TeamJoinEvent in https://github.com/slackapi/bolt-js/pull/1890 – thanks [@be320](https://github.com/be320)!

### Documentation

* Improve the docs for better TypeScript compatibility in https://github.com/slackapi/bolt-js/pull/1844 – thanks [@seratch](https://github.com/seratch)!
* Fixes [#1477](https://github.com/slackapi/bolt-js/issues/1477) Add customPropertiesExtractor to receiver options docs in https://github.com/slackapi/bolt-js/pull/1864 – thanks [@mlauter](https://github.com/mlauter)!

### Dependencies

* Bump @types/node from 18.16.0 to 18.16.3 in https://github.com/slackapi/bolt-js/pull/1822 – thanks [@dependabot](https://github.com/dependabot)!
* Bump @types/node from 18.16.3 to 20.1.0 in https://github.com/slackapi/bolt-js/pull/1829 – thanks [@dependabot](https://github.com/dependabot)!
* Add node version 20 to NodeJS testing strategy in https://github.com/slackapi/bolt-js/pull/1830 – thanks [@srajiang](https://github.com/srajiang)!
* Bump @types/node from 20.1.0 to 20.1.4 in https://github.com/slackapi/bolt-js/pull/1837 – thanks [@dependabot](https://github.com/dependabot)!
* Bump @slack/types version to ^2.8.0 in https://github.com/slackapi/bolt-js/pull/1838 – thanks [@zimeg](https://github.com/zimeg)!
* Bump @types/node from 20.1.4 to 20.2.3 in https://github.com/slackapi/bolt-js/pull/1850 – thanks [@dependabot](https://github.com/dependabot)!
* Bump @types/node from 20.2.3 to 20.2.5 in https://github.com/slackapi/bolt-js/pull/1858 – thanks [@dependabot](https://github.com/dependabot)!
* Bump @types/node from 20.2.5 to 20.3.0 in https://github.com/slackapi/bolt-js/pull/1868 – thanks [@dependabot](https://github.com/dependabot)!
* Bump @types/node from 20.3.0 to 20.3.1 in https://github.com/slackapi/bolt-js/pull/1874 – thanks [@dependabot](https://github.com/dependabot)!
* Bump @types/node from 20.3.1 to 20.4.1 in https://github.com/slackapi/bolt-js/pull/1893 – thanks [@dependabot](https://github.com/dependabot)!

## New Contributors
* [@mlauter](https://github.com/mlauter) made their first contribution in https://github.com/slackapi/bolt-js/pull/1849
* [@gilmatok](https://github.com/gilmatok) made their first contribution in https://github.com/slackapi/bolt-js/pull/1853
* [@be320](https://github.com/be320) made their first contribution in https://github.com/slackapi/bolt-js/pull/1890

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.13.1...@slack/bolt@3.13.2

[Changes][@slack/bolt@3.13.2]


<a name="@slack/bolt@3.13.1"></a>
# [@slack/bolt@3.13.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.13.1) - 28 Apr 2023

### Enhancements

* Upgrade the OAuth module to the latest in https://github.com/slackapi/bolt-js/pull/1802 – thanks [@seratch](https://github.com/seratch)!

### Bug fixes

* Fix [#1805](https://github.com/slackapi/bolt-js/issues/1805) Include headers in the request object of custom route handlers in https://github.com/slackapi/bolt-js/pull/1806 – thanks [@e-zim](https://github.com/e-zim)!

### Documentation

* Add documentation for dynamic route parameters in custom routes in https://github.com/slackapi/bolt-js/pull/1791 – thanks [@e-zim](https://github.com/e-zim)!
* Add line numbers to docs in https://github.com/slackapi/bolt-js/pull/1797 – thanks [@WilliamBergamin](https://github.com/WilliamBergamin)!

### Dependencies

* Bump @types/node from 18.15.11 to 18.16.0 in https://github.com/slackapi/bolt-js/pull/1810 – thanks [@dependabot](https://github.com/dependabot)!

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.13.0...@slack/bolt@3.13.1

[Changes][@slack/bolt@3.13.1]


<a name="@slack/bolt@3.13.0"></a>
# [@slack/bolt@3.13.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.13.0) - 04 Apr 2023

## What's Changed

### Enhancements

* Fix [#1718](https://github.com/slackapi/bolt-js/issues/1718) selected_date_time is missing in ViewStateValue interface by [@seratch](https://github.com/seratch) in https://github.com/slackapi/bolt-js/pull/1719
* Fix [#1325](https://github.com/slackapi/bolt-js/issues/1325) Added support for dynamic custom paths by [@jeffbaldwinjr](https://github.com/jeffbaldwinjr) in https://github.com/slackapi/bolt-js/pull/1785

### Bug fixes

* Fix [#1758](https://github.com/slackapi/bolt-js/issues/1758) Correct type definitions for `OptionGroups` and `*Options` types by [@zimeg](https://github.com/zimeg) in https://github.com/slackapi/bolt-js/pull/1790

### Tests

* Test against node 18.x by [@machisuke](https://github.com/machisuke) in https://github.com/slackapi/bolt-js/pull/1792

### Documentation

* Add in update to AWS Lambda guide to make ExpressReceiver config more clear by [@hello-ashleyintech](https://github.com/hello-ashleyintech) in https://github.com/slackapi/bolt-js/pull/1649
* Update Heroku guides with the new low-cost Eco Dyno plan by [@mwbrooks](https://github.com/mwbrooks) in https://github.com/slackapi/bolt-js/pull/1655
* Reword migrate beta documentation by [@srajiang](https://github.com/srajiang) in https://github.com/slackapi/bolt-js/pull/1668
* 📝 Improve doc: remove double quotes from hash key by [@yamashush](https://github.com/yamashush) in https://github.com/slackapi/bolt-js/pull/1685
* 📄 Update Japanese OAuth docs by [@yamashush](https://github.com/yamashush) in https://github.com/slackapi/bolt-js/pull/1697
* Add reference to Slack documentation on `block_actions` payload shape  by [@srajiang](https://github.com/srajiang) in https://github.com/slackapi/bolt-js/pull/1700
* Update outdated documents related on AWS Lambda by [@wormwlrm](https://github.com/wormwlrm) in https://github.com/slackapi/bolt-js/pull/1704
* [next-gen docs] Update next-gen capitalization of terms and also trim down on the getting started guide by [@hello-ashleyintech](https://github.com/hello-ashleyintech) in https://github.com/slackapi/bolt-js/pull/1709
* Typo in docs -> future -> beta TOS link by [@funtaps](https://github.com/funtaps) in https://github.com/slackapi/bolt-js/pull/1716
* Fix typo in japanese docs: concepts#logging by [@sotabkw](https://github.com/sotabkw) in https://github.com/slackapi/bolt-js/pull/1787
* Remove legacy tag by [@WilliamBergamin](https://github.com/WilliamBergamin) in https://github.com/slackapi/bolt-js/pull/1796

### Dependencies

* Bump @types/node from 18.11.8 to 18.11.9 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1650
* Bump @types/node from 18.11.9 to 18.11.10 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1670
* Bump @types/node from 18.11.10 to 18.11.13 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1680
* 🔼 Update actions/checkout, actions/setup-node to v3 by [@yamashush](https://github.com/yamashush) in https://github.com/slackapi/bolt-js/pull/1686
* Bump @types/node from 18.11.13 to 18.11.17 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1689
* Bump @types/node from 18.11.17 to 18.11.18 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1705
* Update @slack/oauth dependency to v2.6.0 by [@srajiang](https://github.com/srajiang) in https://github.com/slackapi/bolt-js/pull/1708
* Bump @types/node from 18.11.18 to 18.11.19 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1734
* Bump @types/node from 18.11.19 to 18.13.0 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1738
* Bump @types/node from 18.13.0 to 18.14.0 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1745
* Bump @types/node from 18.14.0 to 18.14.2 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1754
* Bump @types/node from 18.14.2 to 18.14.6 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1757
* Fix [#1780](https://github.com/slackapi/bolt-js/issues/1780) by upgrading axios version to the latest by [@SorsOps](https://github.com/SorsOps) in https://github.com/slackapi/bolt-js/pull/1781
* Bump @types/node from 18.14.6 to 18.15.10 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1786
* Bump @types/node from 18.15.10 to 18.15.11 by [@dependabot](https://github.com/dependabot) in https://github.com/slackapi/bolt-js/pull/1794

### Chores

* Release: @slack/bolt@3.13.0 by [@zimeg](https://github.com/zimeg) in https://github.com/slackapi/bolt-js/pull/1795

## New Contributors

* [@wormwlrm](https://github.com/wormwlrm) made their first contribution in https://github.com/slackapi/bolt-js/pull/1704
* [@funtaps](https://github.com/funtaps) made their first contribution in https://github.com/slackapi/bolt-js/pull/1716
* [@SorsOps](https://github.com/SorsOps) made their first contribution in https://github.com/slackapi/bolt-js/pull/1781
* [@sotabkw](https://github.com/sotabkw) made their first contribution in https://github.com/slackapi/bolt-js/pull/1787
* [@jeffbaldwinjr](https://github.com/jeffbaldwinjr) made their first contribution in https://github.com/slackapi/bolt-js/pull/1785
* [@machisuke](https://github.com/machisuke) made their first contribution in https://github.com/slackapi/bolt-js/pull/1792

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.12.2...@slack/bolt@3.13.0

[Changes][@slack/bolt@3.13.0]


<a name="@slack/bolt@4.0.0-nextGen.9"></a>
# [@slack/bolt@4.0.0-nextGen.9](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@4.0.0-nextGen.9) - 11 Nov 2022

## What's Changed
* Added `block_suggestions` event support for Function Interactivity, thanks [@hello-ashleyintech](https://github.com/hello-ashleyintech) [@filmaj](https://github.com/filmaj)! https://github.com/slackapi/bolt-js/pull/1645
* Add in update to AWS Lambda guide to make ExpressReceiver config more clear, thanls [@hello-ashleyintech](https://github.com/hello-ashleyintech) in https://github.com/slackapi/bolt-js/pull/1649

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.12.2...@slack/bolt@4.0.0-nextGen.9

[Changes][@slack/bolt@4.0.0-nextGen.9]


<a name="@slack/bolt@3.12.2"></a>
# [@slack/bolt@3.12.2](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.12.2) - 02 Nov 2022

## What's Changed
* Updated maintainers guide to add more clarity by [@WilliamBergamin](https://github.com/WilliamBergamin) in https://github.com/slackapi/bolt-js/pull/1519
* Delete unnecessary character from doc by [@koh110](https://github.com/koh110) in https://github.com/slackapi/bolt-js/pull/1545
* Update SocketModeFunctions.ts by [@rileyeaton](https://github.com/rileyeaton) in https://github.com/slackapi/bolt-js/pull/1553
* Delete CHANGELOG.md by [@WilliamBergamin](https://github.com/WilliamBergamin) in https://github.com/slackapi/bolt-js/pull/1556
* Fix misspellings / typos detected by WebStorm IDE by [@seratch](https://github.com/seratch) in https://github.com/slackapi/bolt-js/pull/1557
* Fixed trivial typo by [@akmhmgc](https://github.com/akmhmgc) in https://github.com/slackapi/bolt-js/pull/1575
* Set @types/node to set version 18.7.15 by [@hello-ashleyintech](https://github.com/hello-ashleyintech) in https://github.com/slackapi/bolt-js/pull/1577
* Add next-gen beta documentation by [@stevengill](https://github.com/stevengill) in https://github.com/slackapi/bolt-js/pull/1565
* Bump .ruby-version from 2.7.1 to 2.7.4 by [@e-zim](https://github.com/e-zim) in https://github.com/slackapi/bolt-js/pull/1594
* Add in information about custom HTTP routes to docs by [@hello-ashleyintech](https://github.com/hello-ashleyintech) in https://github.com/slackapi/bolt-js/pull/1601
* Fix node types by [@srajiang](https://github.com/srajiang) in https://github.com/slackapi/bolt-js/pull/1607
* Update getting started guide, migrate create new app guide, and rearrange nav (next gen) by [@hello-ashleyintech](https://github.com/hello-ashleyintech) in https://github.com/slackapi/bolt-js/pull/1603
* Spelling by [@jsoref](https://github.com/jsoref) in https://github.com/slackapi/bolt-js/pull/1610
* Add in Hello World example across docs by [@hello-ashleyintech](https://github.com/hello-ashleyintech) in https://github.com/slackapi/bolt-js/pull/1608
* Fix context.team_id for view interactions in a Slack Connect channel by [@WilliamBergamin](https://github.com/WilliamBergamin) in https://github.com/slackapi/bolt-js/pull/1615
* Add deployment guide for Heroku by [@e-zim](https://github.com/e-zim) in https://github.com/slackapi/bolt-js/pull/1617
* Publish @slack/bolt@3.12.2 by [@hello-ashleyintech](https://github.com/hello-ashleyintech) in https://github.com/slackapi/bolt-js/pull/1646

## New Contributors
* [@WilliamBergamin](https://github.com/WilliamBergamin) made their first contribution in https://github.com/slackapi/bolt-js/pull/1519
* [@rileyeaton](https://github.com/rileyeaton) made their first contribution in https://github.com/slackapi/bolt-js/pull/1553
* [@akmhmgc](https://github.com/akmhmgc) made their first contribution in https://github.com/slackapi/bolt-js/pull/1575
* [@jsoref](https://github.com/jsoref) made their first contribution in https://github.com/slackapi/bolt-js/pull/1610

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.12.1...@slack/bolt@3.12.2

[Changes][@slack/bolt@3.12.2]


<a name="@slack/bolt@4.0.0-nextGen.8"></a>
# [@slack/bolt@4.0.0-nextGen.8](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@4.0.0-nextGen.8) - 14 Oct 2022

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@4.0.0-nextGen.6...@slack/bolt@4.0.0-nextGen.8

[Changes][@slack/bolt@4.0.0-nextGen.8]


<a name="@slack/bolt@4.0.0-nextGen.6"></a>
# [@slack/bolt@4.0.0-nextGen.6](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@4.0.0-nextGen.6) - 14 Sep 2022

**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.12.1...@slack/bolt@4.0.0-nextGen.6

[Changes][@slack/bolt@4.0.0-nextGen.6]


<a name="@slack/bolt@4.0.0-nextGen.3"></a>
# [@slack/bolt@4.0.0-nextGen.3](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@4.0.0-nextGen.3) - 09 Sep 2022


**Full Changelog**: https://github.com/slackapi/bolt-js/compare/@slack/bolt@4.0.0-nextGen.2...@slack/bolt@4.0.0-nextGen.3

[Changes][@slack/bolt@4.0.0-nextGen.3]


<a name="@slack/bolt@4.0.0-nextGen.2"></a>
# [@slack/bolt@4.0.0-nextGen.2](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@4.0.0-nextGen.2) - 08 Sep 2022

## What's Changed (beta)
This beta release contains feature enhancements to Bolt JS for developers participating in the Slack Platform Beta 🚀 

### **Compatible with the Slack CLI tool** 

  Create a new app from a Github sample template
  ```bash
  $ slack create my-app -t slack-samples/bolt-js-starter-template -b future
  ```
  Run your app for local development from the CLI. We take care of installation, tokens and starting the app in development mode. 
  ```bash
  $ slack run 
  ```
### Configure your app in code 
Declare a `manifest.js` or `manifest.ts` file import handly utility functions and  define any recomposable units contained such as `Functions`, `Workflows` and `Triggers`. 
```bash
# my-app/manifest.js

const { Manifest } = require('@slack/bolt');
module.exports = Manifest({
  runOnSlack: false,
  name: '',
  displayName: '',
  description: '',
  botScopes: ['chat:write'],
  socketModeEnabled: true,
  workflows: [TimeOffWorkflow],
  features: {
    appHome: {
      messagesTabEnabled: true,
      messagesTabReadOnlyEnabled: true,
    },
  },
  settings: {
    interactivity: {
      is_enabled: true,
    },
    org_deploy_enabled: false,
  },
});

```

### **Compose Custom Function handling logic via a `SlackFunction`**. 
Write a recomposable unit of logic: 

   Example:
  ```javascript
      const myFunc = new SlackFunction('fn_callback_id', () => {});
  ```
   Attach optional handlers for `block_action` and `view` events related to your function.

   Example:
   ```js
      myFunc.action('action_id', () => {})
            .view('view_callback_id', () => {});
   ```

## Enhancements
* Bolt-JS projects containing a valid `slack.json` file in their project root are now Slack CLI compatible by [@srajiang](https://github.com/srajiang) 
* Adds CLI hook implementations `get-manifest` `start` and `get-hooks` by [@srajiang](https://github.com/srajiang) 
* Exports utility types and functions intended for `manifest.js` authoring by [@srajiang](https://github.com/srajiang) [@neptunel](https://github.com/neptunel) 
* Adds SlackFunction and Function Localized Interactivity handling by [@srajiang](https://github.com/srajiang) in https://github.com/slackapi/bolt-js/pull/1567

### Full Changelog
 https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.12.1...@slack/bolt@4.0.0-nextGen.2

[Changes][@slack/bolt@4.0.0-nextGen.2]


<a name="@slack/bolt@3.12.1"></a>
# [@slack/bolt@3.12.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.12.1) - 26 Jul 2022

* Fix [#1509](https://github.com/slackapi/bolt-js/issues/1509) HTTPReceiver does not immediately respond to an invalid signature request (no response instead) (via [#1528](https://github.com/slackapi/bolt-js/issues/1528) ) - thanks [@seratch](https://github.com/seratch)! [@nirvparekh](https://github.com/nirvparekh)!
* Document improvements ([#1524](https://github.com/slackapi/bolt-js/issues/1524) [#1526](https://github.com/slackapi/bolt-js/issues/1526)) - thanks [@wongjas](https://github.com/wongjas)!

Here is the list of all the issues / pull requests included in the release: https://github.com/slackapi/bolt-js/milestone/28?closed=1

[Changes][@slack/bolt@3.12.1]


<a name="@slack/bolt@3.12.0"></a>
# [@slack/bolt@3.12.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.12.0) - 14 Jul 2022

* Fix [#1507](https://github.com/slackapi/bolt-js/issues/1507) Add type support for `message_metadata_*` event types (via [#1508](https://github.com/slackapi/bolt-js/issues/1508)) - thanks [@dannyhostetler](https://github.com/dannyhostetler)!
* Allow passing additional types for Global and Middleware Context (via [#1505](https://github.com/slackapi/bolt-js/issues/1505)) - thanks [@M1kep](https://github.com/M1kep)!
* Fix [#1510](https://github.com/slackapi/bolt-js/issues/1510): Add `isEnterpriseInstall` to Context (via [#1511](https://github.com/slackapi/bolt-js/issues/1511)) - thanks [@rockingskier](https://github.com/rockingskier)!
* Fix [#1052](https://github.com/slackapi/bolt-js/issues/1052): Request verification failed: Failed to verify authenticity: stale (via [#1503](https://github.com/slackapi/bolt-js/issues/1503)) - thanks [@srajiang](https://github.com/srajiang)!
* Fixed receiver warning typo (via [#1492](https://github.com/slackapi/bolt-js/issues/1492)) - thanks [@nick-w-nick](https://github.com/nick-w-nick)!

Here is the list of all the issues / pull requests included in the release: https://github.com/slackapi/bolt-js/milestone/21?closed=1

[Changes][@slack/bolt@3.12.0]


<a name="@slack/bolt@3.11.3"></a>
# [@slack/bolt@3.11.3](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.11.3) - 17 Jun 2022

* Fix [#1488](https://github.com/slackapi/bolt-js/issues/1488) Incorrect types with ViewUpdateResponseAction and ViewPushResponseAction (via [#1490](https://github.com/slackapi/bolt-js/issues/1490)) - thanks [@seratch](https://github.com/seratch) [@ducminh-phan](https://github.com/ducminh-phan)!

Here is the list of all the issues / pull requests included in the release: https://github.com/slackapi/bolt-js/milestone/26?closed=1

[Changes][@slack/bolt@3.11.3]


<a name="@slack/bolt@3.11.2"></a>
# [@slack/bolt@3.11.2](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.11.2) - 14 Jun 2022

* Bug fixes:
  * Fix [#1454](https://github.com/slackapi/bolt-js/issues/1454): Missing type declarations for HomeView (via [#1455](https://github.com/slackapi/bolt-js/issues/1455)) - thanks [@seratch](https://github.com/seratch)!
  * TypeScript 4.7 compiler compatibility (via [#1466](https://github.com/slackapi/bolt-js/issues/1466)) - thanks [@seratch](https://github.com/seratch)!
  * Fix [#1472](https://github.com/slackapi/bolt-js/issues/1472): `say` type incorrectly inferred as never when using `pin_added` or `reaction_*` events (via [#1473](https://github.com/slackapi/bolt-js/issues/1473) and [#1476](https://github.com/slackapi/bolt-js/issues/1476)) - thanks [@seratch](https://github.com/seratch)!
  * Fix an action typo in the docs (via [#1475](https://github.com/slackapi/bolt-js/issues/1475)) - thanks [@BenAlderfer](https://github.com/BenAlderfer)!
  * Add more logs for error patterns in AwsLambdaReceiver (via [#1481](https://github.com/slackapi/bolt-js/issues/1481)) - thanks [@seratch](https://github.com/seratch)!
  * Fix [#1478](https://github.com/slackapi/bolt-js/issues/1478): `ack()` is not accessible in global middleware in TypeScript (via [#1482](https://github.com/slackapi/bolt-js/issues/1482)) - thanks [@seratch](https://github.com/seratch)!

Here is the list of all the issues / pull requests included in the release: https://github.com/slackapi/bolt-js/milestone/25?closed=1

[Changes][@slack/bolt@3.11.2]


<a name="@slack/bolt@3.11.1"></a>
# [@slack/bolt@3.11.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.11.1) - 13 May 2022

* New features / improvements:
  * Adding support for new user-change events with types (via [#1448](https://github.com/slackapi/bolt-js/issues/1448)) - thanks [@filmaj](https://github.com/filmaj) 
  * Slack prints failed with the error "operation_timeout" when slack command runs and finishes successfully in AWS Lambda (via [#1435](https://github.com/slackapi/bolt-js/issues/1435) [#1452](https://github.com/slackapi/bolt-js/issues/1452)) - thanks [@nicolls1](https://github.com/nicolls1) 
  * Upgrade socket-mode dependency to the latest minor (via [#1441](https://github.com/slackapi/bolt-js/issues/1441) ) - thanks [@seratch](https://github.com/seratch) !

Here is the list of all the issues / pull requests included in the release: https://github.com/slackapi/bolt-js/milestone/24?closed=1

[Changes][@slack/bolt@3.11.1]


<a name="@slack/bolt@3.11.0"></a>
# [@slack/bolt@3.11.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.11.0) - 30 Mar 2022

### 📣 Important Announcement

Since this version, the default behavior of the OAuth flow has been changed for better security. The changes are:
* `InstallProvider` (The underlying OAuth module) verifies not only the query string but also its corresponding browser cookie data
* The default `StateStore` (`ClearStateStore`) makes sure that the state parameter is not too old (the default lifetime is 10 minutes)

Refer to [#1335](https://github.com/slackapi/bolt-js/issues/1335) [#1391](https://github.com/slackapi/bolt-js/issues/1391) https://github.com/slackapi/node-slack-sdk/issues/1435 https://github.com/slackapi/node-slack-sdk/pull/1436 for the context. If you encounter behavior changes described at [#1412](https://github.com/slackapi/bolt-js/issues/1412), consider either changing your app code or setting `installerOptions.legacyStateVerification: true` for now.

### 🎁 🐛 New features / improvements:
  * [#1391](https://github.com/slackapi/bolt-js/issues/1391) Fix [#1335](https://github.com/slackapi/bolt-js/issues/1335) Proper use of state parameter for the OAuth CSRF protection - Thanks [@seratch](https://github.com/seratch) 
  * [#1405](https://github.com/slackapi/bolt-js/issues/1405) Fix [#1404](https://github.com/slackapi/bolt-js/issues/1404) SocketModeReceiver app process exits when any of its event listeners throws an exception - Thanks [@seratch](https://github.com/seratch) 
  * [#1359](https://github.com/slackapi/bolt-js/issues/1359) Fix [#1358](https://github.com/slackapi/bolt-js/issues/1358) Expose common utilities for building HTTP module based receivers - Thanks [@seratch](https://github.com/seratch) 
  * [#1406](https://github.com/slackapi/bolt-js/issues/1406) Add more error handlers to ExpressReceiver - Thanks [@seratch](https://github.com/seratch) [@Gregoor](https://github.com/Gregoor)
  * [#1392](https://github.com/slackapi/bolt-js/issues/1392) Fix [#1385](https://github.com/slackapi/bolt-js/issues/1385) Create a signature validation function that is not tied to the request - Thanks [@seratch](https://github.com/seratch) [@danerwilliams](https://github.com/danerwilliams)
  * [#1393](https://github.com/slackapi/bolt-js/issues/1393) Fix [#1376](https://github.com/slackapi/bolt-js/issues/1376) CustomRoute interface should be accessible from developers - Thanks [@seratch](https://github.com/seratch) 
  * [#1381](https://github.com/slackapi/bolt-js/issues/1381) Fix [#1380](https://github.com/slackapi/bolt-js/issues/1380) by adding more event payload types - Thanks [@seratch](https://github.com/seratch) [@aasiddiq](https://github.com/aasiddiq)
  * [#1400](https://github.com/slackapi/bolt-js/issues/1400) Fix [#1397](https://github.com/slackapi/bolt-js/issues/1397) bolt-js does not accept ssl_check requests properly - Thanks [@seratch](https://github.com/seratch) 
  * [#1340](https://github.com/slackapi/bolt-js/issues/1340) Fix [#1334](https://github.com/slackapi/bolt-js/issues/1334) Export `EnvelopedEvent` interface to users - Thanks [@martin-cycle](https://github.com/martin-cycle)
  * [#1366](https://github.com/slackapi/bolt-js/issues/1366) Fix [#1364](https://github.com/slackapi/bolt-js/issues/1364) Update axios to latest 0.26.1 - Thanks [@seratch](https://github.com/seratch) [@msrivastav13](https://github.com/msrivastav13)
  * [#1369](https://github.com/slackapi/bolt-js/issues/1369) Fix [#1368](https://github.com/slackapi/bolt-js/issues/1368) Log `httpServer.close` error only when the `server` exists - Thanks [@sbcgua](https://github.com/sbcgua)
  * [#1336](https://github.com/slackapi/bolt-js/issues/1336) [#1401](https://github.com/slackapi/bolt-js/issues/1401) [#1403](https://github.com/slackapi/bolt-js/issues/1403) [#1407](https://github.com/slackapi/bolt-js/issues/1407) Improve the SDK's test assets - Thanks [@seratch](https://github.com/seratch) [@filmaj](https://github.com/filmaj) 

### 📝  Document updates:
  * [#1384](https://github.com/slackapi/bolt-js/issues/1384) Deploy the App to Heroku with one click - Thanks [@MaurizioBella](https://github.com/MaurizioBella)

Here are [all the issues / pull requests](https://github.com/slackapi/bolt-js/milestone/18?closed=1) included in the release.

[Changes][@slack/bolt@3.11.0]


<a name="@slack/bolt@3.10.0"></a>
# [@slack/bolt@3.10.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.10.0) - 23 Feb 2022

 🎁 🐛 New features / improvements:
  * Added an option to `deferInitialization` of App - [#248](https://github.com/slackapi/bolt-js/issues/248) [#1303](https://github.com/slackapi/bolt-js/issues/1303) - Thanks [@seratch](https://github.com/seratch) and [@SpencerKaiser](https://github.com/SpencerKaiser)
  * We're now explicitly setting content-type on `HTTPReceiver` responses to `/slack/install` route - [#1279](https://github.com/slackapi/bolt-js/issues/1279) [#1280](https://github.com/slackapi/bolt-js/issues/1280) - Thanks [@filmaj](https://github.com/filmaj) 
  * Reduced unnecessary error throwing in case of `tokens_authorize` / `app_uninstalled` event [#674](https://github.com/slackapi/bolt-js/issues/674) [#1328](https://github.com/slackapi/bolt-js/issues/1328), - Thanks [@seratch](https://github.com/seratch) 
  * Updated `SlackEvent` union type to include `ChannelIDChangedEvent` - [#1302](https://github.com/slackapi/bolt-js/issues/1302) [#1301](https://github.com/slackapi/bolt-js/issues/1301) Thanks [@pmezard](https://github.com/pmezard) and [@srajiang](https://github.com/srajiang) 
  * Corrected typing for `UserChangeEvent.user.updated` attribute [#1320](https://github.com/slackapi/bolt-js/issues/1320) [#1322](https://github.com/slackapi/bolt-js/issues/1322)  - Thanks [@seratch](https://github.com/seratch) and [@pmezard](https://github.com/pmezard)
  * Removed redundant authorize code [#1231](https://github.com/slackapi/bolt-js/issues/1231) [#1327](https://github.com/slackapi/bolt-js/issues/1327)  - Thanks [@seratch](https://github.com/seratch) and [@TEMHITHORPHE](https://github.com/TEMHITHORPHE) 
  * Corrected some pesky quotes [#1323](https://github.com/slackapi/bolt-js/issues/1323) - Thanks [@nicolls1](https://github.com/nicolls1) 

📝  Document updates:
  * New documentation for `deferInitialization` [#1304](https://github.com/slackapi/bolt-js/issues/1304),  [#1308](https://github.com/slackapi/bolt-js/issues/1308) - Thanks [@filmaj](https://github.com/filmaj), [@wongjas](https://github.com/wongjas), [@seratch](https://github.com/seratch)!
  * Improved clarity and content of OAuth documentation [#1329](https://github.com/slackapi/bolt-js/issues/1329) [#1315](https://github.com/slackapi/bolt-js/issues/1315) [#1318](https://github.com/slackapi/bolt-js/issues/1318) - Thanks [@srajiang](https://github.com/srajiang), [@horeaporutiu](https://github.com/horeaporutiu)
  * Added a 🇯🇵 translation for `userScopes` property - [#1295](https://github.com/slackapi/bolt-js/issues/1295) - Thanks [@wongjas](https://github.com/wongjas) 
  * Updated `respond` argument docs to include `views` listener [#1313](https://github.com/slackapi/bolt-js/issues/1313) - Thanks [@seratch](https://github.com/seratch)

Here are [all the issues / pull requests](https://github.com/slackapi/bolt-js/milestone/17?closed=1) included in the release.

[Changes][@slack/bolt@3.10.0]


<a name="@slack/bolt@3.9.0"></a>
# [@slack/bolt@3.9.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.9.0) - 20 Jan 2022

* New features / improvements:
  * Bump `@slack/web-api` dependency to at least v6.6.0 to address a security vulnerability in `axios` (via [#1276](https://github.com/slackapi/bolt-js/issues/1276)) - thanks [@filmaj](https://github.com/filmaj)!
  * Bump `@slack/oauth` dependency to at least v2.4.0 to address major bugs (via [#1273](https://github.com/slackapi/bolt-js/issues/1273)) - thanks [@seratch](https://github.com/seratch)!
  * Fix [#1256](https://github.com/slackapi/bolt-js/issues/1256): `$PORT` fails to bind on Heroku (via [#1210](https://github.com/slackapi/bolt-js/issues/1210)) - thanks [@filmaj](https://github.com/filmaj)!
  * Add missing `Channel*MessageEvent` types (via [#1254](https://github.com/slackapi/bolt-js/issues/1254)) - thanks [@seratch](https://github.com/seratch)!
  * Fix [#190](https://github.com/slackapi/bolt-js/issues/190): Context method `updateConversation` should accept expiration time (via [#1221](https://github.com/slackapi/bolt-js/issues/1221)) - thanks [@shubhamjajoo](https://github.com/shubhamjajoo)!
  * Fix [#1206](https://github.com/slackapi/bolt-js/issues/1206): custom routes incorrectly match against full URL including querystring parameters (via [#1207](https://github.com/slackapi/bolt-js/issues/1207)) - thanks [@moustacheful](https://github.com/moustacheful)!
* Document updates:
  * Improve App initialization error logs and Authenticating with OAuth document (via [#1250](https://github.com/slackapi/bolt-js/issues/1250)) - thanks [@srajiang](https://github.com/srajiang)!
  * Fix [#795](https://github.com/slackapi/bolt-js/issues/795): improving documentation around serverless deployments to make more accessible (via [#1254](https://github.com/slackapi/bolt-js/issues/1254)) - thanks [@filmaj](https://github.com/filmaj)!
  * Update anchors in the Japanese reference page (via [#1247](https://github.com/slackapi/bolt-js/issues/1247)) - thanks [@seratch](https://github.com/seratch)!
  * Fix [#1237](https://github.com/slackapi/bolt-js/issues/1237): Use correct message subtype in Listening to Events documentation (via [#1240](https://github.com/slackapi/bolt-js/issues/1240)) - thanks [@wongjas](https://github.com/wongjas)!
  * Fix [#1233](https://github.com/slackapi/bolt-js/issues/1233) and [#1216](https://github.com/slackapi/bolt-js/issues/1216): Remove redundant `state` information from the Listening to Modals documentation (via [#1236](https://github.com/slackapi/bolt-js/issues/1236)) - thanks [@wongjas](https://github.com/wongjas)!
  * Fix [#1241](https://github.com/slackapi/bolt-js/issues/1241): Update examples to use the `logger` instead of `console.log` (via [#1242](https://github.com/slackapi/bolt-js/issues/1242)) - thanks [@wongjas](https://github.com/wongjas)!
  * Cleanup Lambda example and docs around `processBeforeResponse` (via [#1229](https://github.com/slackapi/bolt-js/issues/1229)) - thanks [@ramblingenzyme](https://github.com/ramblingenzyme)!
  * Fix [#1197](https://github.com/slackapi/bolt-js/issues/1197): Japanese version of documents around `extendedErrorHandler` (via [#1227](https://github.com/slackapi/bolt-js/issues/1227)) - thanks [@wongjas](https://github.com/wongjas)!
  * Add documentation for socket mode and developer mode (via [#1218](https://github.com/slackapi/bolt-js/issues/1218)) - thanks [@TheManWhoStaresAtCode](https://github.com/TheManWhoStaresAtCode)!
  * Fix [#1219](https://github.com/slackapi/bolt-js/issues/1219): Japanese version of additional socket mode and developer mode documentation (via [#1226](https://github.com/slackapi/bolt-js/issues/1226)) - thanks [@wongjas](https://github.com/wongjas)!
  * Fix [#1010](https://github.com/slackapi/bolt-js/issues/1010): Add documentation for `view_closed` support (via [#1214](https://github.com/slackapi/bolt-js/issues/1214)) - thanks [@TheManWhoStaresAtCode](https://github.com/TheManWhoStaresAtCode)!
  * Fix [#1200](https://github.com/slackapi/bolt-js/issues/1200): Remove references to passing a port to the `start` method when using socket mode (via [#1202](https://github.com/slackapi/bolt-js/issues/1202)) - thanks [@filmaj](https://github.com/filmaj)!
* Developer / maintainer-relevant changes:
  * Added a GitHub action and bot to automatically mark issues and PRs as stale after extended periods of inactivity (via [#1213](https://github.com/slackapi/bolt-js/issues/1213), [#1225](https://github.com/slackapi/bolt-js/issues/1225)) - thanks [@srajiang](https://github.com/srajiang)!

Here is the list of all the issues / pull requests included in the release: https://github.com/slackapi/bolt-js/milestone/16?closed=1

[Changes][@slack/bolt@3.9.0]


<a name="@slack/bolt@3.8.1"></a>
# [@slack/bolt@3.8.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.8.1) - 03 Nov 2021

* New features / improvements:
  * Fix [#759](https://github.com/slackapi/bolt-js/issues/759) [#1109](https://github.com/slackapi/bolt-js/issues/1109) [#1110](https://github.com/slackapi/bolt-js/issues/1110) by adding custom properties in ReceiverEvent and Context objects ([#1177](https://github.com/slackapi/bolt-js/issues/1177)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#860](https://github.com/slackapi/bolt-js/issues/860) Enable developers to customize the built-in receivers more ([#1183](https://github.com/slackapi/bolt-js/issues/1183)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#1181](https://github.com/slackapi/bolt-js/issues/1181) Add port property to installerOptions in the HTTPReceiver ([#1184](https://github.com/slackapi/bolt-js/issues/1184)) - Thanks [@seratch](https://github.com/seratch) [@M1kep](https://github.com/M1kep)!
  * Add port property to installerOptions in the HTTPReceiver ([#1181](https://github.com/slackapi/bolt-js/issues/1181)) - Thanks [@srajiang](https://github.com/srajiang)!
  * Add context to global error handler ([#525](https://github.com/slackapi/bolt-js/issues/525)) - Thanks [@raycharius](https://github.com/raycharius)!
  * Fix [#1098](https://github.com/slackapi/bolt-js/issues/1098) next() is optional in middleware in TypeScript ([#1099](https://github.com/slackapi/bolt-js/issues/1099)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#1148](https://github.com/slackapi/bolt-js/issues/1148) - Adjust the app.message listener interface in TypeScript to compile the examples in documents ([#1185](https://github.com/slackapi/bolt-js/issues/1185)) - Thanks [@M1kep](https://github.com/M1kep)!
  * BlockAction interface does not include state despite state being present in actual object ([#1141](https://github.com/slackapi/bolt-js/issues/1141) [#1144](https://github.com/slackapi/bolt-js/issues/1144)) - Thanks [@seratch](https://github.com/seratch) [@Richard-PTT](https://github.com/Richard-PTT)!
  * Add more information to unhandled incoming request logging ([#1143](https://github.com/slackapi/bolt-js/issues/1143)) - Thanks [@misscoded](https://github.com/misscoded)!
  * Bump axios version to 0.21.2 or higher for better security ([#1162](https://github.com/slackapi/bolt-js/issues/1162)) - Thanks [@xmariopereira](https://github.com/xmariopereira)!
  * Fix the v3.8.0 publish error ([#1194](https://github.com/slackapi/bolt-js/issues/1194)) - Thanks [@brianjychan](https://github.com/brianjychan)
* Document updates:
  * Japanese document updates ([#1047](https://github.com/slackapi/bolt-js/issues/1047) [#1152](https://github.com/slackapi/bolt-js/issues/1152) [#1131](https://github.com/slackapi/bolt-js/issues/1131) [#1154](https://github.com/slackapi/bolt-js/issues/1154) [#1165](https://github.com/slackapi/bolt-js/issues/1165) [#1163](https://github.com/slackapi/bolt-js/issues/1163) [#1166](https://github.com/slackapi/bolt-js/issues/1166) [#1169](https://github.com/slackapi/bolt-js/issues/1169) [#1175](https://github.com/slackapi/bolt-js/issues/1175)) - Thanks [@wongjas](https://github.com/wongjas)! 
  * Fix the logging example so that it is valid JS ([#1172](https://github.com/slackapi/bolt-js/issues/1172) [#1174](https://github.com/slackapi/bolt-js/issues/1174)) - Thanks [@filmaj](https://github.com/filmaj)!
  * Fix documentation about state verification option ([#1168](https://github.com/slackapi/bolt-js/issues/1168)) - Thanks [@stophecom](https://github.com/stophecom)!
  * Fix call in AWS handler to match example (and be correct) ([#1190](https://github.com/slackapi/bolt-js/issues/1190)) - Thanks [@sirctseb](https://github.com/sirctseb)!
  * using directMention() documentation doesn't seem to be correct in docs ([#1148](https://github.com/slackapi/bolt-js/issues/1148)) - Thanks [@O-Mutt](https://github.com/O-Mutt)!
  * Clarify /slack/events path requirement ([#1153](https://github.com/slackapi/bolt-js/issues/1153)) - Thanks [@mars](https://github.com/mars)!
  * Update Japanese docs to apply token rotation ([#1009](https://github.com/slackapi/bolt-js/issues/1009)) changes ([#1014](https://github.com/slackapi/bolt-js/issues/1014)) - Thanks [@misscoded](https://github.com/misscoded)!
  * Update slugs in document pages ([#1161](https://github.com/slackapi/bolt-js/issues/1161)) - Thanks [@srajiang](https://github.com/srajiang)!
  * Japanese document updates ([#1067](https://github.com/slackapi/bolt-js/issues/1067) [#1137](https://github.com/slackapi/bolt-js/issues/1137)) - Thanks [@seratch](https://github.com/seratch)!
  * Minor updates related to [#1046](https://github.com/slackapi/bolt-js/issues/1046) ([#1047](https://github.com/slackapi/bolt-js/issues/1047)) - Thanks [@seratch](https://github.com/seratch)!

Here is the list of all the issues / pull requests included in the release: https://github.com/slackapi/bolt-js/milestone/15?closed=1

[Changes][@slack/bolt@3.8.1]


<a name="@slack/bolt@3.8.0"></a>
# [@slack/bolt@3.8.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.8.0) - 03 Nov 2021

This version had a package file issue. Please use [v3.8.1](https://github.com/slackapi/bolt-js/releases/tag/%40slack%2Fbolt%403.8.1) or newer instead.

[Changes][@slack/bolt@3.8.0]


<a name="@slack/bolt@3.7.0"></a>
# [@slack/bolt@3.7.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.7.0) - 27 Sep 2021

Loads of updates and improvements this go-around with the help of feedback from the community 🎉 Many many thanks!

* Support for custom HTTP routes ([#834](https://github.com/slackapi/bolt-js/issues/834), [#866](https://github.com/slackapi/bolt-js/issues/866), [#1114](https://github.com/slackapi/bolt-js/issues/1114)) - Thank you [@misscoded](https://github.com/misscoded) and [@johnboxall](https://github.com/johnboxall)!
* Added a stateVerification flag to support org-wide app install from admin pages! ([#1101](https://github.com/slackapi/bolt-js/issues/1101), [#1116](https://github.com/slackapi/bolt-js/issues/1116)) - Thank you [@srajiang](https://github.com/srajiang) and [@seratch](https://github.com/seratch)!
* Migrated fully to eslint ([#1024](https://github.com/slackapi/bolt-js/issues/1024), [#842](https://github.com/slackapi/bolt-js/issues/842), [#1089](https://github.com/slackapi/bolt-js/issues/1089), [#1091](https://github.com/slackapi/bolt-js/issues/1091) ) - Dzięki [@filmaj](https://github.com/filmaj) and [@srajiang](https://github.com/srajiang) and [@seratch](https://github.com/seratch)!
* Option to use custom Express app / router via ExpressReceiver ([#1084](https://github.com/slackapi/bolt-js/issues/1084), [#868](https://github.com/slackapi/bolt-js/issues/868)) - Muito obrigado [@seratch](https://github.com/seratch)!
* Added an option to disable signature verification for use during testing ([#648](https://github.com/slackapi/bolt-js/issues/648), [#1088](https://github.com/slackapi/bolt-js/issues/1088)) - Dankeschön [@seratch](https://github.com/seratch) and [@meetmangukiya](https://github.com/meetmangukiya)!
* Enabled developers to disable and customize installation pages ([#982](https://github.com/slackapi/bolt-js/issues/982), [#1083](https://github.com/slackapi/bolt-js/issues/1083), [#977](https://github.com/slackapi/bolt-js/issues/977) , [#1079](https://github.com/slackapi/bolt-js/issues/1079)) - 谢谢 [@seratch](https://github.com/seratch)!
* Enabled using Bolt JS without passing a botId ([#874](https://github.com/slackapi/bolt-js/issues/874), [#1087](https://github.com/slackapi/bolt-js/issues/1087)) - Thanks [@misscoded](https://github.com/misscoded)! 
* Custom redirect URI options are now properly being sent as part of standard install request params ([#1115](https://github.com/slackapi/bolt-js/issues/1115), [#1116](https://github.com/slackapi/bolt-js/issues/1116)) - Hvala [@srajiang](https://github.com/srajiang)!
* Improved handling for event authorization errors ([#859](https://github.com/slackapi/bolt-js/issues/859), [#364](https://github.com/slackapi/bolt-js/issues/364) [#891](https://github.com/slackapi/bolt-js/issues/891)) - Bedankt [@seratch](https://github.com/seratch), [@zachsirotto](https://github.com/zachsirotto) and [@broom9](https://github.com/broom9)!
* Better App initialization experience when SocketMode and Receiver options are both supplied ([#1068](https://github.com/slackapi/bolt-js/issues/1068), [#1077](https://github.com/slackapi/bolt-js/issues/1077)) - شكرًا [@seratch](https://github.com/seratch)!
* Improved logger initialization experience ([#1040](https://github.com/slackapi/bolt-js/issues/1040), [#1078](https://github.com/slackapi/bolt-js/issues/1078), [#1027](https://github.com/slackapi/bolt-js/issues/1027)) - Mahalo [@tamaritamari](https://github.com/tamaritamari), [@seratch](https://github.com/seratch), and [@dominics](https://github.com/dominics)
* Docs improvements and other corrections! ([#1130](https://github.com/slackapi/bolt-js/issues/1130), [#1129](https://github.com/slackapi/bolt-js/issues/1129), [#1082](https://github.com/slackapi/bolt-js/issues/1082), [#1071](https://github.com/slackapi/bolt-js/issues/1071), [#1097](https://github.com/slackapi/bolt-js/issues/1097), [#1095](https://github.com/slackapi/bolt-js/issues/1095)) - 감사합니다 [@risto24](https://github.com/risto24), [@srajiang](https://github.com/srajiang), [@seratch](https://github.com/seratch), [@stevengill](https://github.com/stevengill))!

[Changes][@slack/bolt@3.7.0]


<a name="@slack/bolt@3.6.0"></a>
# [@slack/bolt@3.6.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.6.0) - 19 Aug 2021

* Added Slack Connect Events ([#999](https://github.com/slackapi/bolt-js/issues/999), [#1008](https://github.com/slackapi/bolt-js/issues/1008)) - Thanks [@srajiang](https://github.com/srajiang) 
* Made App start() account for AWSLambdaReceiver return type ([#1038](https://github.com/slackapi/bolt-js/issues/1038), [#1039](https://github.com/slackapi/bolt-js/issues/1039)) - Thanks [@seratch](https://github.com/seratch) 
* Added tests for SocketModeReciver ([#750](https://github.com/slackapi/bolt-js/issues/750), [#1021](https://github.com/slackapi/bolt-js/issues/1021)) - Thanks [@filmaj](https://github.com/filmaj) 
* Docs, docs, docs and example app improvements! ([#1062](https://github.com/slackapi/bolt-js/issues/1062), [#1066](https://github.com/slackapi/bolt-js/issues/1066), [#1067](https://github.com/slackapi/bolt-js/issues/1067), [#1059](https://github.com/slackapi/bolt-js/issues/1059) , [#1046](https://github.com/slackapi/bolt-js/issues/1046), [#1056](https://github.com/slackapi/bolt-js/issues/1056), [#1048](https://github.com/slackapi/bolt-js/issues/1048), [#1039](https://github.com/slackapi/bolt-js/issues/1039), [#1023](https://github.com/slackapi/bolt-js/issues/1023), [#939](https://github.com/slackapi/bolt-js/issues/939), [#1021](https://github.com/slackapi/bolt-js/issues/1021), [#1033](https://github.com/slackapi/bolt-js/issues/1033)) - Thanks [@sisisin](https://github.com/sisisin), [@hariNEzuMI928](https://github.com/hariNEzuMI928), [@RhnSharma](https://github.com/RhnSharma) and [@stevengill](https://github.com/stevengill), [@seratch](https://github.com/seratch), [@filmaj](https://github.com/filmaj), [@srajiang](https://github.com/srajiang) 


[Changes][@slack/bolt@3.6.0]


<a name="@slack/bolt@3.6.0-hermesBeta.1"></a>
# [@slack/bolt@3.6.0-hermesBeta.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.6.0-hermesBeta.1) - 20 Aug 2021

* Contains bumped version of @slack/web-api for hermesBeta

[Changes][@slack/bolt@3.6.0-hermesBeta.1]


<a name="@slack/bolt@3.5.0"></a>
# [@slack/bolt@3.5.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.5.0) - 15 Jul 2021

- Added support for `FileInstallationStore` ([#941](https://github.com/slackapi/bolt-js/issues/941), [#1003](https://github.com/slackapi/bolt-js/issues/1003)) - Thanks, [@misscoded](https://github.com/misscoded)!
- Fix to existing code snippet around acknowledging events ([#997](https://github.com/slackapi/bolt-js/issues/997)) - Thanks, [@Zimboboys](https://github.com/Zimboboys)!
- Brought Socket Mode to the forefront of the Getting Started docs ([#990](https://github.com/slackapi/bolt-js/issues/990)) - Thanks, [@srajiang](https://github.com/srajiang)!
- Documentation updates and improvements ([#989](https://github.com/slackapi/bolt-js/issues/989), [#1002](https://github.com/slackapi/bolt-js/issues/1002)) - Thanks, [@srajiang](https://github.com/srajiang) and [@misscoded](https://github.com/misscoded)!

[Changes][@slack/bolt@3.5.0]


<a name="@slack/bolt@3.4.1"></a>
# [@slack/bolt@3.4.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.4.1) - 05 Jul 2021

* Updated default `axios` options to include `proxy:false` to match @slack/web-api package ([#979](https://github.com/slackapi/bolt-js/issues/979)) - thanks [@stevengill](https://github.com/stevengill) 
* Fixed `AwsLambdaReceiver` failing to parse `event.body` if `isBase64Encoded` is `true` ([#971](https://github.com/slackapi/bolt-js/issues/971), [#972](https://github.com/slackapi/bolt-js/issues/972)) - thanks [@TheManWhoStaresAtCode](https://github.com/TheManWhoStaresAtCode)
* Added `edited` property to `app_mention` event payload ([#960](https://github.com/slackapi/bolt-js/issues/960), [#961](https://github.com/slackapi/bolt-js/issues/961)) - thanks [@seratch](https://github.com/seratch) and [@hi-se](https://github.com/hi-se)
* Added a new deploy-aws-lambda project to the [examples directory](https://github.com/slackapi/bolt-js/tree/main/examples/deploy-aws-lambda) ([#815](https://github.com/slackapi/bolt-js/issues/815), [#940](https://github.com/slackapi/bolt-js/issues/940)) - thanks [@TheManWhoStaresAtCode](https://github.com/TheManWhoStaresAtCode)
* Use Kanji for Japanese documents ([#983](https://github.com/slackapi/bolt-js/issues/983)) - thanks [@disneyresidents](https://github.com/disneyresidents) 

[Changes][@slack/bolt@3.4.1]


<a name="@slack/bolt@3.4.0"></a>
# [@slack/bolt@3.4.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.4.0) - 04 Jun 2021

Many improvements (thanks to the awesome contributors!) are included in this release :tada:

* Key improvements / bug fixes:
  * Allow command handlers to match regexes ([#846](https://github.com/slackapi/bolt-js/issues/846)) - Thanks [@itowlson](https://github.com/itowlson)!
  * Fix [#947](https://github.com/slackapi/bolt-js/issues/947) Enable to use app.client with passed token for single workspace apps ([#948](https://github.com/slackapi/bolt-js/issues/948)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#935](https://github.com/slackapi/bolt-js/issues/935) enterprise_id in InstallationQuery can be invalid for Slack Connect channel events ([#949](https://github.com/slackapi/bolt-js/issues/949)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#951](https://github.com/slackapi/bolt-js/issues/951) TypeScript 4.3 typing for KnownKeys\<ChatPostMessageArguments\> ([#953](https://github.com/slackapi/bolt-js/issues/953)) - Thanks [@lokshunhung](https://github.com/lokshunhung)!
  * Fix [#629](https://github.com/slackapi/bolt-js/issues/629) confusing debug log by ConversationStore ([#827](https://github.com/slackapi/bolt-js/issues/827)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#496](https://github.com/slackapi/bolt-js/issues/496) Add clientOptions.logger option (and improvements to other attributes too) ([#856](https://github.com/slackapi/bolt-js/issues/856)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#757](https://github.com/slackapi/bolt-js/issues/757) Add event type name validation & channel_type filter middleware  ([#857](https://github.com/slackapi/bolt-js/issues/857)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#718](https://github.com/slackapi/bolt-js/issues/718) add tokenVerificationEnabled flag to App constructor ([#863](https://github.com/slackapi/bolt-js/issues/863)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#534](https://github.com/slackapi/bolt-js/issues/534) respond support in view_submission listeners ([#889](https://github.com/slackapi/bolt-js/issues/889)) - Thanks [@seratch](https://github.com/seratch)!
  * Add async support of signingSecret to ExpressReceiver ([#877](https://github.com/slackapi/bolt-js/issues/877)) - Thanks [@gmathieu](https://github.com/gmathieu)!
  * AwsLambdaReveiver: Ignore casing of HTTP headers as requested by RFC ([#938](https://github.com/slackapi/bolt-js/issues/938)) - Thanks [@TheManWhoStaresAtCode](https://github.com/TheManWhoStaresAtCode)!
* Improvements / bugfixes for better TypeScript supports:
  * Fix [#926](https://github.com/slackapi/bolt-js/issues/926) by adding more subtype ones to message event types ([#928](https://github.com/slackapi/bolt-js/issues/928)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#925](https://github.com/slackapi/bolt-js/issues/925) by adding optional properties to CodedError interface ([#927](https://github.com/slackapi/bolt-js/issues/927)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#897](https://github.com/slackapi/bolt-js/issues/897) Add built-in fields to Context object type ([#902](https://github.com/slackapi/bolt-js/issues/902)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#894](https://github.com/slackapi/bolt-js/issues/894) Unable to build options request objects in TypeScript ([#900](https://github.com/slackapi/bolt-js/issues/900)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#720](https://github.com/slackapi/bolt-js/issues/720) ack(options) does not compile in TypeScript ([#878](https://github.com/slackapi/bolt-js/issues/878)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#497](https://github.com/slackapi/bolt-js/issues/497) Add types of state.values on modal submission ([#879](https://github.com/slackapi/bolt-js/issues/879)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#911](https://github.com/slackapi/bolt-js/issues/911) TypeScript error when using builtin onlyViewActions middleware ([#912](https://github.com/slackapi/bolt-js/issues/912)) - Thanks [@seratch](https://github.com/seratch)!
  * Add blocks / attachments to app_mention event interface ([#906](https://github.com/slackapi/bolt-js/issues/906)) - Thanks [@seratch](https://github.com/seratch)!
  * Add missing message events & more type tests ([#832](https://github.com/slackapi/bolt-js/issues/832)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#956](https://github.com/slackapi/bolt-js/issues/956) Add bot_id / bot_profile to GenericMessageEvent ([#957](https://github.com/slackapi/bolt-js/issues/957)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix a few array field definition errors in TypeScript  ([#873](https://github.com/slackapi/bolt-js/issues/873)) - Thanks [@seratch](https://github.com/seratch)!
  * Make API response types more specific utilizing the types in web-api 6.2  ([#915](https://github.com/slackapi/bolt-js/issues/915)) - Thanks [@seratch](https://github.com/seratch)!
  * Add is_bot_user_member to link_shared event ([#946](https://github.com/slackapi/bolt-js/issues/946)) - Thanks [@rbrishabh](https://github.com/rbrishabh)!
  * Fix WorkflowStep StepUpdateArguments property types ([#830](https://github.com/slackapi/bolt-js/issues/830)) - Thanks [@k725](https://github.com/k725)!
  * Add the type for plain_text_input action elements ([#706](https://github.com/slackapi/bolt-js/issues/706)) - Thanks [@br-tim-ray](https://github.com/br-tim-ray)!
  * Updated ReactionRemovedEvent type ([#918](https://github.com/slackapi/bolt-js/issues/918)) - Thanks [@rr-codes](https://github.com/rr-codes)!
  * Export options types and interfaces ([#872](https://github.com/slackapi/bolt-js/issues/872)) - Thanks [@trevor-gullstad](https://github.com/trevor-gullstad)!
  * Add trigger_id to ViewSubmitAction interface ([#828](https://github.com/slackapi/bolt-js/issues/828)) - Thanks [@misscoded](https://github.com/misscoded)!
* Lots of documentation improvements:
  * Fix a typo in Japanese documents ([#916](https://github.com/slackapi/bolt-js/issues/916)) - Thanks [@p-chan](https://github.com/p-chan)!
  * Small clarification constraint reference ([#844](https://github.com/slackapi/bolt-js/issues/844)) - Thanks [@shaydewael](https://github.com/shaydewael)!
  * Add TypeScript Getting Started equivalent ([#845](https://github.com/slackapi/bolt-js/issues/845)) - Thanks [@shaydewael](https://github.com/shaydewael)!
  * Add JA-JP reference ([#851](https://github.com/slackapi/bolt-js/issues/851)) - Thanks [@shaydewael](https://github.com/shaydewael)!
  * Update the default receiver in the reference document ([#835](https://github.com/slackapi/bolt-js/issues/835)) - Thanks [@seratch](https://github.com/seratch)!
  * Update the description about processBeforeResponse in Reference document ([#836](https://github.com/slackapi/bolt-js/issues/836)) - Thanks [@seratch](https://github.com/seratch)!
  * Fix [#632](https://github.com/slackapi/bolt-js/issues/632) Add Japanese version of PR [#626](https://github.com/slackapi/bolt-js/issues/626) (App Home document) ([#852](https://github.com/slackapi/bolt-js/issues/852)) - Thanks [@seratch](https://github.com/seratch)!

Here is the list of all the issues / pull requests included in the release: https://github.com/slackapi/bolt-js/milestone/8?closed=1

[Changes][@slack/bolt@3.4.0]


<a name="@slack/bolt@3.3.0"></a>
# [@slack/bolt@3.3.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.3.0) - 09 Mar 2021

- Add regex support to events handler ([#284](https://github.com/slackapi/bolt-js/issues/284) [#763](https://github.com/slackapi/bolt-js/issues/763)) - Thanks [@pdontha](https://github.com/pdontha)!
- Fix typo in `SocketModeReceiver` logging sentence ([#807](https://github.com/slackapi/bolt-js/issues/807)) - Thanks [@KhushrajRathod](https://github.com/KhushrajRathod)!
- Refactor built-in receivers to be a little more DRY ([#810](https://github.com/slackapi/bolt-js/issues/810)) - Thanks [@seratch](https://github.com/seratch)!
- Add built-in `AwsLambdaReceiver` ([#784](https://github.com/slackapi/bolt-js/issues/784) [#785](https://github.com/slackapi/bolt-js/issues/785)) - Thanks [@seratch](https://github.com/seratch)!
- Simplify `app.start()` for Socket Mode by allowing extra arguments to be optional ([#823](https://github.com/slackapi/bolt-js/issues/823)) - Thanks [@KhushrajRathod](https://github.com/KhushrajRathod)
- Lots of documentation improvements!
    - Fix `event.user` to correctly reference user ID ([#790](https://github.com/slackapi/bolt-js/issues/790)) - Thanks [@mwbrooks](https://github.com/mwbrooks)
    - Add Japanese translation for AWS Lambda Deployment Guide ([#798](https://github.com/slackapi/bolt-js/issues/798)) - Thanks [@seratch](https://github.com/seratch) [@shay](https://github.com/shay)
    - Update AWS Lambda Deployment guide to use `@vendia/serverless-express` ([#799](https://github.com/slackapi/bolt-js/issues/799) [#800](https://github.com/slackapi/bolt-js/issues/800) [#804](https://github.com/slackapi/bolt-js/issues/804) [#806](https://github.com/slackapi/bolt-js/issues/806)) - Thanks [@januswel](https://github.com/januswel) [@avery100](https://github.com/avery100) [@mwbrooks](https://github.com/mwbrooks)
    - Clarify that OAuth is not supported by custom receivers ([#711](https://github.com/slackapi/bolt-js/issues/711)) - Thanks [@mwbrooks](https://github.com/mwbrooks)

[Changes][@slack/bolt@3.3.0]


<a name="@slack/bolt@3.2.0"></a>
# [@slack/bolt@3.2.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.2.0) - 10 Feb 2021

* Added new `channel_id_changed` event ([#779](https://github.com/slackapi/bolt-js/issues/779), [#783](https://github.com/slackapi/bolt-js/issues/783)) - thanks [@stevengill](https://github.com/stevengill) 
* Added missing properties on Message Types ([#774](https://github.com/slackapi/bolt-js/issues/774), [#782](https://github.com/slackapi/bolt-js/issues/782)) - thanks [@shaydewael](https://github.com/shaydewael), [@sunakane](https://github.com/sunakane)
* Fixed inconsistencies with OAuth docs ([#777](https://github.com/slackapi/bolt-js/issues/777)) - thanks [@misscoded](https://github.com/misscoded)
* Export Reaction interfaces ([#765](https://github.com/slackapi/bolt-js/issues/765), [#776](https://github.com/slackapi/bolt-js/issues/776)) - thanks [@KhushrajRathod](https://github.com/KhushrajRathod), [@feliperyan](https://github.com/feliperyan) 

[Changes][@slack/bolt@3.2.0]


<a name="@slack/bolt@3.1.1"></a>
# [@slack/bolt@3.1.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.1.1) - 27 Jan 2021

Updated `@slack/socket-mode` dependency to use a range (`^1.0.0`) instead of a specific version - thanks [@stevengill](https://github.com/stevengill)

[Changes][@slack/bolt@3.1.1]


<a name="@slack/bolt@3.1.0"></a>
# [@slack/bolt@3.1.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.1.0) - 26 Jan 2021

* Added Four New Workflow / Workflow Step Event Interfaces ([#767](https://github.com/slackapi/bolt-js/issues/767), [#768](https://github.com/slackapi/bolt-js/issues/768)) - thanks [@misscoded](https://github.com/misscoded)  
* Fixed node-slack-sdk issue [1156](https://github.com/slackapi/node-slack-sdk/issues/1156) where Socket Mode error was not bubbling up ([#764](https://github.com/slackapi/bolt-js/issues/764)) - thanks [@stevengill](https://github.com/stevengill) 
* Added a localized Japanese Heroku deployment guide ([#762](https://github.com/slackapi/bolt-js/issues/762)) - thanks [@seratch](https://github.com/seratch), [@shaydewael](https://github.com/shaydewael) 

[Changes][@slack/bolt@3.1.0]


<a name="@slack/bolt@3.0.0"></a>
# [@slack/bolt@3.0.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@3.0.0) - 13 Jan 2021


## Breaking changes
- Updated minimum Nodejs version to 12.13.0, updated minimum TypeScript version to 4.1 ([#727](https://github.com/slackapi/bolt-js/issues/727), [#728](https://github.com/slackapi/bolt-js/issues/728)) - thanks [@stevengill](https://github.com/stevengill)
- Removed `orgAuthorize` option when initializing `App`. If you used this option previously, you must use `authorize`  instead for both single workspace installs and [org wide app installs](https://api.slack.com/enterprise/apps). See the [migration guide](https://slack.dev/bolt-js/tutorial/migration-v3) to learn more! ([#730](https://github.com/slackapi/bolt-js/issues/730)) - thanks [@stevengill](https://github.com/stevengill)
- The built-in OAuth with [Org wide app installs](https://api.slack.com/enterprise/apps) no longer uses `InstallationStore.fetchOrgInstallation()` or `InstallationStore.storeOrgInstallation()`. If you used these previously, you must use  `InstallationStore.fetchInstallation()` and `InstallationStore.storeInstallation()` instead. See the [migration guide](https://slack.dev/bolt-js/tutorial/migration-v3) to learn more! ([#730](https://github.com/slackapi/bolt-js/issues/730)) - thanks [@stevengill](https://github.com/stevengill)

## New Features
- Bolt for JavaScript now supports Socket Mode! When initializing an `App`, use the `socketMode: true` option to choose connecting to Slack without an HTTP server (:wave: goodbye managing ngrok). In order to use Socket Mode, you must first enable it for your app’s configuration (https://api.slack.com/apps → Your App → Socket Mode).
    - This is implemented using the new `SocketModeReceiver` class. This receiver allows your app to receive events from Slack over a WebSocket connection.
    - To learn more about Socket Mode, checkout the release blog post and [Bolt for JavaScript docs](https://slack.dev/bolt-js/concepts#socket-mode) and [example](https://github.com/slackapi/bolt-js/tree/main/examples/socket-mode)
    - Implemented in [#630](https://github.com/slackapi/bolt-js/issues/630) - thanks [@stevengill](https://github.com/stevengill), [@aoberoi](https://github.com/aoberoi), [@seratch](https://github.com/seratch), [@shaydewael](https://github.com/shaydewael), [@mwbrooks](https://github.com/mwbrooks)
- Added a new Developer Mode. When initializing an `App`, conditionally check for when you’re not in production (e.g. `process.NODE_ENV !==` `'``production``'` ) to set `developerMode:` ```true`. Developer Mode currently enables debug logging, enables SocketMode, adds a custom failure handler for OAuth, and outputs the body of every incoming request. ([#714](https://github.com/slackapi/bolt-js/issues/714), [#742](https://github.com/slackapi/bolt-js/issues/742)) - thanks [@stevengill](https://github.com/stevengill)
-  `HTTPReceiver` is the new default receiver for `App`. This will allow Bolt for JavaScript apps to more easily work with other popular web frameworks (Hapi.js, Koa, etc).  ([#670](https://github.com/slackapi/bolt-js/issues/670), [#753](https://github.com/slackapi/bolt-js/issues/753)) - thanks [@aoberoi](https://github.com/aoberoi)
    - `ExpressReceiver` is still available to use for those of you that have usecases which aren’t covered by `HTTPReceiver`. 
    - This new receiver does not allow you to add custom routes, but instead allows you to access its `requestListener` property to selectively send it requests. This property follows the exact function signature as the first argument to Node’s built-in `http.createServer()`, so it’s very flexible. It will throw an `HTTPReceiverDeferredRequestError`, with a `req` and `res` property if it was not able to handle a given request.
- Added support for starting an HTTPS server with `app.start()` . This method now takes TLS options as its second parameter (after the port). The simplest example of starting an HTTP server is `app.start(3000, { key: MY_TLS_KEY, cert: MY_TLS_CERT })`. ([#234](https://github.com/slackapi/bolt-js/issues/234), [#658](https://github.com/slackapi/bolt-js/issues/658)) - thanks [@aoberoi](https://github.com/aoberoi)

[Changes][@slack/bolt@3.0.0]


<a name="@slack/bolt@2.7.0"></a>
# [@slack/bolt@2.7.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.7.0) - 12 Jan 2021

* Fix regression in `is_enterprise_install` check for slash commands ([#737](https://github.com/slackapi/bolt-js/issues/737), [#738](https://github.com/slackapi/bolt-js/issues/738)) - thanks [@mattcasey](https://github.com/mattcasey) 
* Added missing properties to `AppMentionInterface` ([#735](https://github.com/slackapi/bolt-js/issues/735), [#739](https://github.com/slackapi/bolt-js/issues/739)) - thanks [@misscoded](https://github.com/misscoded), [@BenAlderfer](https://github.com/BenAlderfer)
* Add `channel` and other missing properties to all `MessageEvent` interfaces ([#736](https://github.com/slackapi/bolt-js/issues/736), [#740](https://github.com/slackapi/bolt-js/issues/740)) - thanks [@misscoded](https://github.com/misscoded), [@BenAlderfer](https://github.com/BenAlderfer)

[Changes][@slack/bolt@2.7.0]


<a name="@slack/bolt@2.6.0"></a>
# [@slack/bolt@2.6.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.6.0) - 05 Jan 2021

* Fixed security vulnerability with `axios` dependency ([#721](https://github.com/slackapi/bolt-js/issues/721), [#722](https://github.com/slackapi/bolt-js/issues/722)) - Thanks [@brendan-miller-snyk](https://github.com/brendan-miller-snyk) 
* Added reference docs to [documentation site](https://slack.dev/bolt-js/reference) ([#712](https://github.com/slackapi/bolt-js/issues/712)) - Thanks [@shaydewael](https://github.com/shaydewael) 
* Added [deploying to AWS Lambda guide](https://slack.dev/bolt-js/deployments/aws-lambda) ([#698](https://github.com/slackapi/bolt-js/issues/698)) - Thanks [@mwbrooks](https://github.com/mwbrooks)
* Improved types for message events and all subtypes. ([#709](https://github.com/slackapi/bolt-js/issues/709), [#311](https://github.com/slackapi/bolt-js/issues/311)) - Thanks [@aoberoi](https://github.com/aoberoi) 
* Moved CI over to GitHub Actions ([#704](https://github.com/slackapi/bolt-js/issues/704)) - Thanks [@stevengill](https://github.com/stevengill) 

[Changes][@slack/bolt@2.6.0]


<a name="@slack/bolt@2.5.0"></a>
# [@slack/bolt@2.5.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.5.0) - 01 Dec 2020

* Added support for [org wide app installations](https://api.slack.com/enterprise/apps). If you are using the [built-in OAuth support](https://slack.dev/bolt-js/concepts#authenticating-oauth), make sure to update your `InstallationStore` by adding `saveOrgInstall` and `fetchOrgInstall` methods. ([#521](https://github.com/slackapi/bolt-js/issues/521)) - thanks [@stevengill](https://github.com/stevengill), [@aoberoi](https://github.com/aoberoi)  
* added support for `Authorizations` in event api payloads which are replacing `authed_users` and `authed_teams`  ([#655](https://github.com/slackapi/bolt-js/issues/655), [#656](https://github.com/slackapi/bolt-js/issues/656)) - thanks [@stevengill](https://github.com/stevengill) 
* Added [heroku deployment guide](https://slack.dev/bolt-js/deployments/heroku) ([#220](https://github.com/slackapi/bolt-js/issues/220), [#651](https://github.com/slackapi/bolt-js/issues/651)) - thanks [@mwbrooks](https://github.com/mwbrooks) 
* Docs fixes ([#641](https://github.com/slackapi/bolt-js/issues/641), [#665](https://github.com/slackapi/bolt-js/issues/665), [#667](https://github.com/slackapi/bolt-js/issues/667), [#668](https://github.com/slackapi/bolt-js/issues/668), [#683](https://github.com/slackapi/bolt-js/issues/683), [#686](https://github.com/slackapi/bolt-js/issues/686), [#693](https://github.com/slackapi/bolt-js/issues/693) ) - thanks [@shaydewael](https://github.com/shaydewael), [@misscoded](https://github.com/misscoded), [@mwbrooks](https://github.com/mwbrooks), [@seratch](https://github.com/seratch), [@stevengill](https://github.com/stevengill) 
* Updated hubot example to work with bolt for Javascript v2.0+ ([#676](https://github.com/slackapi/bolt-js/issues/676)) - thanks [@nicholas-a-clark](https://github.com/nicholas-a-clark) 


[Changes][@slack/bolt@2.5.0]


<a name="@slack/bolt@2.4.1"></a>
# [@slack/bolt@2.4.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.4.1) - 30 Sep 2020

* Fixes the `StepUpdateArguments` and `StepCompleteArguments` type definitions to correctly, and more precisely, describe the arguments to the `update()` and `complete()` utility arguments when building a `WorkflowStep` - Thanks [@seratch](https://github.com/seratch) ([#653](https://github.com/slackapi/bolt-js/issues/653))


[Changes][@slack/bolt@2.4.1]


<a name="@slack/bolt@2.4.0"></a>
# [@slack/bolt@2.4.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.4.0) - 30 Sep 2020

* The new `WorkflowStep` class gives Bolt apps the ability to offer Workflow Builder [Steps from Apps](https://api.slack.com/workflows/steps).

    Slack users can compose Workflows using steps that your app defines. Your app will create the interface for the user to add or edit their step, with the specific inputs and ouputs it needs. Later, Slack will send an event to your app when it's time to execute that step. Learn how to build using [`WorkflowStep` in the Bolt for JS docs](https://slack.dev/bolt-js/concepts#steps).

    Thanks to [@misscoded](https://github.com/misscoded), [@selfcontained](https://github.com/selfcontained), [@amarinelli](https://github.com/amarinelli), [@seratch](https://github.com/seratch)  ([#607](https://github.com/slackapi/bolt-js/issues/607), [#592](https://github.com/slackapi/bolt-js/issues/592), [#593](https://github.com/slackapi/bolt-js/issues/593)  )

* Fixes types for radio buttons and date picker to allow `selected_options` to be `null` - Thanks [@stevengill](https://github.com/stevengill) ([#622](https://github.com/slackapi/bolt-js/issues/622))

* Adds documentation for publishing views to the App Home Home Tab - Thanks [@shaydewael](https://github.com/shaydewael) ([#626](https://github.com/slackapi/bolt-js/issues/626))

* A slew of documentation updates!
  * Updates docs to use `client` listener arg instead of `app.client` consistently - Thanks [@shaydewael](https://github.com/shaydewael) ([#613](https://github.com/slackapi/bolt-js/issues/613))
  * Fixes various errors found in code snippets inside docs (in English and Japanese) - Thanks [@seratch](https://github.com/seratch) ([#628](https://github.com/slackapi/bolt-js/issues/628))
  * Improves code snippet in README to be more Unicode friendly - Thanks [@seratch](https://github.com/seratch) ([#610](https://github.com/slackapi/bolt-js/issues/610))
  * Many incremental improvements to align the Bolt for JS docs with Bolt for Python docs - Thanks [@mwbrooks](https://github.com/mwbrooks) ([#631](https://github.com/slackapi/bolt-js/issues/631), [#623](https://github.com/slackapi/bolt-js/issues/623))
  * Improved and clarified language in shortcuts documentation - Thanks [@shaydewael](https://github.com/shaydewael) ([#563](https://github.com/slackapi/bolt-js/issues/563))
  * Fixes v2 Migration Guide to reflect that error handlers are async functions (in English and Japanese) - Thanks [@atl-mk](https://github.com/atl-mk) ([#599](https://github.com/slackapi/bolt-js/issues/599), [#598](https://github.com/slackapi/bolt-js/issues/598))
  * Clarifies language in "Listening and Responding to a Message" about bot channel membership (in English and Japanese) - Thanks [@misscoded](https://github.com/misscoded), [@seratch](https://github.com/seratch) ([#600](https://github.com/slackapi/bolt-js/issues/600), [#603](https://github.com/slackapi/bolt-js/issues/603))
  * Updating out of date info and removing duplicate info in the README - Thanks [@shaydewael](https://github.com/shaydewael) ([#609](https://github.com/slackapi/bolt-js/issues/609))
  * Improvements to the header: filters out prereleases from showing up in the version badge, uses the more canonical "Bolt for JS" title - Thanks [@misscoded](https://github.com/misscoded), [@shaydewael](https://github.com/shaydewael) ([#602](https://github.com/slackapi/bolt-js/issues/602), [#635](https://github.com/slackapi/bolt-js/issues/635))
  * Improves copy-pastability (yes, I just made that word up) of the OAuth example config - Thanks [@tomquirk](https://github.com/tomquirk) ([#605](https://github.com/slackapi/bolt-js/issues/605))
  * Fixes a typo in the README - Thanks [@kale](https://github.com/kale) ([#606](https://github.com/slackapi/bolt-js/issues/606))
  * Adds missing section break to Getting Started guide - Thanks [@mwbrooks](https://github.com/mwbrooks), [@seratch](https://github.com/seratch) ([#617](https://github.com/slackapi/bolt-js/issues/617), [#618](https://github.com/slackapi/bolt-js/issues/618))

[Changes][@slack/bolt@2.4.0]


<a name="@slack/bolt@2.3.0-workflowStepsBeta.1"></a>
# [@slack/bolt@2.3.0-workflowStepsBeta.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.3.0-workflowStepsBeta.1) - 03 Sep 2020

This release includes additions to the [Workflow Steps from Apps](https://medium.com/slack-developer-blog/stickier-slack-apps-with-workflow-steps-68f24ce48311) beta. 🎉 

- Added `WorkflowStep` class, new utility props, tests, and associated types - Thanks, [@misscoded](https://github.com/misscoded)!
- Updated docs to reflect changes - Thanks, [@misscoded](https://github.com/misscoded)!

Install via `npm install @slack/bolt@feat-workflow-steps`

[Changes][@slack/bolt@2.3.0-workflowStepsBeta.1]


<a name="@slack/bolt@2.3.0"></a>
# [@slack/bolt@2.3.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.3.0) - 21 Aug 2020

* Added `api_app_id` to slash command payloads ([#573](https://github.com/slackapi/bolt-js/issues/573), [#574](https://github.com/slackapi/bolt-js/issues/574)) - Thanks [@stevengill](https://github.com/stevengill)
* `clientOptions` gets passed down to `@slack/oauth` ([#585](https://github.com/slackapi/bolt-js/issues/585), [#586](https://github.com/slackapi/bolt-js/issues/586)) - Thanks [@stevengill](https://github.com/stevengill) 
* Added a new property to `installerOptions` named `authorizationUrl`. This can be used to change the default authorization endpoint when doing OAuth. ([#585](https://github.com/slackapi/bolt-js/issues/585), [#586](https://github.com/slackapi/bolt-js/issues/586)) - Thanks [@stevengill](https://github.com/stevengill) 
* `Bolt-js` now exposes exported interfaces from `@slack/oauth` and everything exported from `@slack/types` ([#585](https://github.com/slackapi/bolt-js/issues/585), [#586](https://github.com/slackapi/bolt-js/issues/586)) - Thanks [@stevengill](https://github.com/stevengill) 

[Changes][@slack/bolt@2.3.0]


<a name="@slack/bolt@2.2.3-workflowStepsBeta.1"></a>
# [@slack/bolt@2.2.3-workflowStepsBeta.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.2.3-workflowStepsBeta.1) - 17 Aug 2020

This release includes additions to the [Workflow Steps from Apps](https://medium.com/slack-developer-blog/stickier-slack-apps-with-workflow-steps-68f24ce48311) beta. 🎉

Add to types associated with the `workflow_step` feature, including optional `workflow_step` object on view submit/close events ([#578](https://github.com/slackapi/bolt-js/issues/578)) - Thanks, [@selfcontained](https://github.com/selfcontained)!

Install via `npm install @slack/bolt@feat-workflow-steps`

[Changes][@slack/bolt@2.2.3-workflowStepsBeta.1]


<a name="@slack/bolt@2.2.0"></a>
# [@slack/bolt@2.2.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.2.0) - 21 Jul 2020

- Made updates for English and Japanese docs ([#417](https://github.com/slackapi/bolt-js/issues/417), [#513](https://github.com/slackapi/bolt-js/issues/513), [#515](https://github.com/slackapi/bolt-js/issues/515), [#518](https://github.com/slackapi/bolt-js/issues/518), [#522](https://github.com/slackapi/bolt-js/issues/522), [#527](https://github.com/slackapi/bolt-js/issues/527), [#535](https://github.com/slackapi/bolt-js/issues/535), [#547](https://github.com/slackapi/bolt-js/issues/547)) - Thanks, [@greggTime](https://github.com/greggTime), [@stevengill](https://github.com/stevengill), and [@seratch](https://github.com/seratch)!
- Added [`calls_rejected`](https://api.slack.com/events/call_rejected) event ([#505](https://github.com/slackapi/bolt-js/issues/505), [#506](https://github.com/slackapi/bolt-js/issues/506)) - Thanks, [@stevengill](https://github.com/stevengill)!
- Added new middleware to filter out `app_mention` events ([#499](https://github.com/slackapi/bolt-js/issues/499)) - Thanks, [@hashedhyphen](https://github.com/hashedhyphen)!
- Added text as an optional property for RespondArguments ([#512](https://github.com/slackapi/bolt-js/issues/512)) - Thanks, [@aoberoi](https://github.com/aoberoi)!
- Added `userScopes` to `AppOptions` ([#540](https://github.com/slackapi/bolt-js/issues/540)) - Thanks, [@joshmcgrath08](https://github.com/joshmcgrath08)!
- Added new interface types for `ReactionAddedEvent` ([#537](https://github.com/slackapi/bolt-js/issues/537)) - Thanks, [@dbmikus](https://github.com/dbmikus)!

[Changes][@slack/bolt@2.2.0]


<a name="@slack/bolt@2.1.1-workflowStepsBeta.1"></a>
# [@slack/bolt@2.1.1-workflowStepsBeta.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.1.1-workflowStepsBeta.1) - 20 Jul 2020

This release is for the [Workflow Steps from Apps](https://medium.com/slack-developer-blog/stickier-slack-apps-with-workflow-steps-68f24ce48311) beta. 🎉 

- Added Workflow Steps support ([#546](https://github.com/slackapi/bolt-js/issues/546)) - Thanks, [@selfcontained](https://github.com/selfcontained)!

Install via `npm install @slack/bolt@feat-workflow-steps`

[Changes][@slack/bolt@2.1.1-workflowStepsBeta.1]


<a name="@slack/bolt@1.8.1"></a>
# [@slack/bolt@1.8.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@1.8.1) - 06 Jul 2020

* added runtime deprecation notice for @slack/bolt 1.x ([#533](https://github.com/slackapi/bolt-js/issues/533)). Please upgrade to the latest version of bolt-js!  - Thanks [@stevengill](https://github.com/stevengill) 


[Changes][@slack/bolt@1.8.1]


<a name="@slack/bolt@2.1.1"></a>
# [@slack/bolt@2.1.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.1.1) - 23 May 2020

* Fixed a bug with custom `ExpressReceivers` not working properly with the new OAuth changes. (https://github.com/slackapi/bolt-js/pull/503) - Thanks [@stevengill](https://github.com/stevengill) & [@marks](https://github.com/marks)

[Changes][@slack/bolt@2.1.1]


<a name="@slack/bolt@2.1.0"></a>
# [@slack/bolt@2.1.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.1.0) - 22 May 2020

* Integrated the [Slack OAuth package](https://slack.dev/node-slack-sdk/oauth) into Bolt-js. Checkout the [Bolt-js docs](https://slack.dev/bolt-js/concepts#authenticating-oauth) to learn more! ([#479](https://github.com/slackapi/bolt-js/issues/479)) - Thanks [@stevengill](https://github.com/stevengill) 
* changed deprecated usage of `res.send` to `res.status(500).send()` ([#487](https://github.com/slackapi/bolt-js/issues/487)) - Thanks [@dburandt](https://github.com/dburandt)
* updates to docs ([#477](https://github.com/slackapi/bolt-js/issues/477)) - Thanks [@shaydewael](https://github.com/shaydewael) 
* Added type aliases for `RadioButton` and `Checkbox` ([#471](https://github.com/slackapi/bolt-js/issues/471)) - Thanks [@yoichiro](https://github.com/yoichiro)



[Changes][@slack/bolt@2.1.0]


<a name="@slack/bolt@2.0.1"></a>
# [@slack/bolt@2.0.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.0.1) - 11 Apr 2020

*  Fixes bug where `processBeforeResponse` option did not ensure processing was complete before HTTP response was sent ([#462](https://github.com/slackapi/bolt-js/issues/462)) - thanks [@aoberoi](https://github.com/aoberoi)
*  Adds the new Bolt for JS brand assets in the documentation site and README ($468) - thanks [@shaydewael](https://github.com/shaydewael)
*  Adds Bolt for JS v2 Migration Guide in Japanese ([#457](https://github.com/slackapi/bolt-js/issues/457)) - thanks [@seratch](https://github.com/seratch)
*  Corrects badly formatted string in the documentation example code ([#460](https://github.com/slackapi/bolt-js/issues/460), [#461](https://github.com/slackapi/bolt-js/issues/461)) - thanks [@takayukioda](https://github.com/takayukioda)


[Changes][@slack/bolt@2.0.1]


<a name="@slack/bolt@2.0.0"></a>
# [@slack/bolt@2.0.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@2.0.0) - 30 Mar 2020

Thanks for checking out the `2.0.0` release of Bolt for JavaScript! Firstly, a huge thank you to all of the folks who contributed to this release. A special shoutout to community contributor [@barlock](https://github.com/barlock) for the massive contributions he contributed!

Make sure to read the [migrating to `2.0.0` guide](https://slack.dev/bolt/tutorial/migration-v2) to learn what changes are needed to upgrade your existing Bolt for JavaScript apps.


- Chaining middleware via promises. This allows the ability to test listeners and middlewares without artificial delays. This change also allows Bolt to run on Functions-as-a-Service platforms (such as AWS Lambda) by allowing the `processBeforeResponse` option to be used. ([#353](https://github.com/slackapi/bolt-js/issues/353), [#380](https://github.com/slackapi/bolt-js/issues/380), [#381](https://github.com/slackapi/bolt-js/issues/381), [#439](https://github.com/slackapi/bolt-js/issues/439), [#440](https://github.com/slackapi/bolt-js/issues/440), [#444](https://github.com/slackapi/bolt-js/issues/444)) - Thanks [@barlock](https://github.com/barlock), [@aoberoi](https://github.com/aoberoi), [@stevengill](https://github.com/stevengill) and [@seratch](https://github.com/seratch)
- [Message shortcuts](https://api.slack.com/interactivity/shortcuts/using#message_shortcuts) (previously referred to as message actions) now use the `shortcut()` method instead of the `action()` method. ([#428](https://github.com/slackapi/bolt-js/issues/428)) - Thanks [@stevengill](https://github.com/stevengill)
- Fix `View` type missing optional id from response ([#436](https://github.com/slackapi/bolt-js/issues/436), [#437](https://github.com/slackapi/bolt-js/issues/437)) - Thanks [@seratch](https://github.com/seratch)
- Added Migration Guide for `@slack/bolt@2.0.0` ([#442](https://github.com/slackapi/bolt-js/issues/442), [#445](https://github.com/slackapi/bolt-js/issues/445), [#449](https://github.com/slackapi/bolt-js/issues/449)) - Thanks [@stevengill](https://github.com/stevengill)
- Added `processBeforeResponse` to `App[Options]` to improve Bolt support for Function-as-a-Service platforms (like [AWS Lambda](https://aws.amazon.com/lambda/)) ([#444](https://github.com/slackapi/bolt-js/issues/444)) - Thanks [@stevengill](https://github.com/stevengill)
- Set minimum TypeScript version to 3.7.0 ([#447](https://github.com/slackapi/bolt-js/issues/447), [#452](https://github.com/slackapi/bolt-js/issues/452)) - Thanks [@aoberoi](https://github.com/aoberoi) and [@stevengill](https://github.com/stevengill)

[Changes][@slack/bolt@2.0.0]


<a name="@slack/bolt@1.8.0"></a>
# [@slack/bolt@1.8.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@1.8.0) - 18 Mar 2020

* Added [Global Shortcuts](https://medium.com/@SlackAPI/introducing-new-ways-to-interact-with-apps-d66e160b8ae) support with the new `.shortcut` method ([#427](https://github.com/slackapi/bolt-js/issues/427), [#430](https://github.com/slackapi/bolt-js/issues/430)) - thanks [@stevengill](https://github.com/stevengill) & [@shaydewael](https://github.com/shaydewael)
* Replaced `bolt` with `bolt for javascript` in our documentation ([#425](https://github.com/slackapi/bolt-js/issues/425)) - thanks [@shaydewael](https://github.com/shaydewael) 
* Fix invalid fields in `MultiUsersSelectAction` ([#422](https://github.com/slackapi/bolt-js/issues/422), [#423](https://github.com/slackapi/bolt-js/issues/423)) - thanks [@seratch](https://github.com/seratch) 




[Changes][@slack/bolt@1.8.0]


<a name="@slack/bolt@1.7.0"></a>
# [@slack/bolt@1.7.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@1.7.0) - 06 Mar 2020

* Specified view submission response action types ([#305](https://github.com/slackapi/bolt-js/issues/305), [#404](https://github.com/slackapi/bolt-js/issues/404)) - Thanks [@aoberoi](https://github.com/aoberoi) 
* Provided a better way to configure `logger` ([#405](https://github.com/slackapi/bolt-js/issues/405), [#406](https://github.com/slackapi/bolt-js/issues/406)) - Thanks [@seratch](https://github.com/seratch) 
* Added checkboxes type support to action payload ([#408](https://github.com/slackapi/bolt-js/issues/408)) - Thanks [@seratch](https://github.com/seratch) 
* Minor docs updates ([#398](https://github.com/slackapi/bolt-js/issues/398), [#348](https://github.com/slackapi/bolt-js/issues/348), [#410](https://github.com/slackapi/bolt-js/issues/410), [#417](https://github.com/slackapi/bolt-js/issues/417)) - Thanks [@seratch](https://github.com/seratch) & [@greggTime](https://github.com/greggTime)


[Changes][@slack/bolt@1.7.0]


<a name="@slack/bolt@1.6.0"></a>
# [@slack/bolt@1.6.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@1.6.0) - 05 Feb 2020

* Added `logger` and `client` to the list of arguments sent through to listeners (such as event, message, etc.). This makes it easier for listeners to make calls to `Web API` methods while keeping the client rate-limit and queue-aware. ([#359](https://github.com/slackapi/bolt-js/issues/359), [#168](https://github.com/slackapi/bolt-js/issues/168), [#354](https://github.com/slackapi/bolt-js/issues/354)) - thanks [@seratch](https://github.com/seratch)
* Added support for the `invite_requested` event type ([#382](https://github.com/slackapi/bolt-js/issues/382), [#387](https://github.com/slackapi/bolt-js/issues/387)) thanks [@seratch](https://github.com/seratch) 
* Update Bolt getting started guide for Granular Bot Permissions ([#373](https://github.com/slackapi/bolt-js/issues/373), [#378](https://github.com/slackapi/bolt-js/issues/378)) - thanks [@shaydewael](https://github.com/shaydewael) 
* Respond with `401` status code instead of `500` for signature verification failures ([#324](https://github.com/slackapi/bolt-js/issues/324), [#362](https://github.com/slackapi/bolt-js/issues/362)) - thanks [@seratch](https://github.com/seratch) 
* Fixed `ack` in `ExpressReceiver` firing twice. ([#327](https://github.com/slackapi/bolt-js/issues/327) [#370](https://github.com/slackapi/bolt-js/issues/370)) - thanks [@jarrodldavis](https://github.com/jarrodldavis)
* `ExpressReceiver's` `RespondFn` implementation now accepts a string ([#377](https://github.com/slackapi/bolt-js/issues/377), [#379](https://github.com/slackapi/bolt-js/issues/379)) - thanks [@seratch](https://github.com/seratch) 
* Added more unit tests for built-in middleware and `ExpressReceiver` ([#357](https://github.com/slackapi/bolt-js/issues/357)) - thanks [@seratch](https://github.com/seratch)
* Minor docs updates ([#352](https://github.com/slackapi/bolt-js/issues/352), [#356](https://github.com/slackapi/bolt-js/issues/356), [#363](https://github.com/slackapi/bolt-js/issues/363), [#374](https://github.com/slackapi/bolt-js/issues/374)) - thanks [@koh110](https://github.com/koh110), [@seratch](https://github.com/seratch), [@byrondover](https://github.com/byrondover) 

[Changes][@slack/bolt@1.6.0]


<a name="@slack/bolt@1.5.0"></a>
# [@slack/bolt@1.5.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@1.5.0) - 20 Dec 2019

* Added support for radio button types in App Home (https://github.com/slackapi/bolt/pull/299) - Thanks [@shaydewael](https://github.com/shaydewael)
* Some nice docs fixes (https://github.com/slackapi/bolt/pull/318) ([#319](https://github.com/slackapi/bolt-js/issues/319))  - Thanks [@yamashush](https://github.com/yamashush), [@shaydewael](https://github.com/shaydewael) 
* Updated the dependency version of `@slack/web-api` to include support for modals ([#322](https://github.com/slackapi/bolt-js/issues/322)) and then again for granular bot permissions ([#335](https://github.com/slackapi/bolt-js/issues/335)) - Thanks [@PerStirpes](https://github.com/PerStirpes), [@seratch](https://github.com/seratch) and [@stevengill](https://github.com/stevengill) 
* Added `type` as a valid constraint for app actions. (https://github.com/slackapi/bolt/pull/326) - Thanks [@selfcontained](https://github.com/selfcontained) 
* Fixed some linting issues (https://github.com/slackapi/bolt/pull/339) - Thanks [@tteltrab](https://github.com/tteltrab) 
* Removed `users.info` call from SingleTeamAuthorization since `auth.test` includes the `bot_id`. This allows developers to reduce scope by creating Bolt apps without a `users:read` scope. ([#347](https://github.com/slackapi/bolt-js/issues/347)) - Thanks [@pichsenmeister](https://github.com/pichsenmeister) 
* For our Typescript users, we made the `channel` field in `block_actions` payload optional ([#343](https://github.com/slackapi/bolt-js/issues/343)), added support for `multi-select` actions ([#344](https://github.com/slackapi/bolt-js/issues/344)), and improved type resolution for action method ([#349](https://github.com/slackapi/bolt-js/issues/349)) - Thanks [@seratch](https://github.com/seratch) and [@stevengill](https://github.com/stevengill)



[Changes][@slack/bolt@1.5.0]


<a name="@slack/bolt@1.4.1"></a>
# [@slack/bolt@1.4.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@1.4.1) - 23 Oct 2019

* Adds updated types for the `app_home_opened` event. The event now contains a `tab` property, which can be set to `"home"` or `"messages"`. The event might also contain a `view` property. These changes are in support of [App Home Home Tabs](https://api.slack.com/surfaces/tabs). ([#292](https://github.com/slackapi/bolt-js/issues/292)) thanks [@seratch](https://github.com/seratch)!

[Changes][@slack/bolt@1.4.1]


<a name="@slack/bolt@1.4.0"></a>
# [@slack/bolt@1.4.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@1.4.0) - 09 Oct 2019

- Adds a much-anticipated enhancement to fire `member_joined_channel` and `member_left_channel` events for your own bot ([#236](https://github.com/slackapi/bolt-js/issues/236)) - thanks [@TK95](https://github.com/TK95) 🎉
- Adds the ability to pass in `WebClient` options into the constructor ([#228](https://github.com/slackapi/bolt-js/issues/228) and [#278](https://github.com/slackapi/bolt-js/issues/278)) - thanks [@koh110](https://github.com/koh110) and [@aoberoi](https://github.com/aoberoi) ⚙️ 
- Adds Japanese 🇯🇵documentation for Block Kit in modals ([#268](https://github.com/slackapi/bolt-js/issues/268)) - thanks [@seratch](https://github.com/seratch) 
- Fixes some typos and mistranslations in the Japanese documentation ([#279](https://github.com/slackapi/bolt-js/issues/279)) - thanks [@grgr-dkrk](https://github.com/grgr-dkrk)
- Adds `view_closed` for Block Kit in modals (uses the same `view()` method) ([#276](https://github.com/slackapi/bolt-js/issues/276)) - thanks [@shanedewael](https://github.com/shanedewael) 
- Removes redundant types for `please-upgrade-node` ([#253](https://github.com/slackapi/bolt-js/issues/253)) - thanks [@43081j](https://github.com/43081j) 
- Adds tests to for the incoming event handler ([#269](https://github.com/slackapi/bolt-js/issues/269)) - thanks [@seratch](https://github.com/seratch) 
- Updates logger + documentation to use `getLevel()` ([#270](https://github.com/slackapi/bolt-js/issues/270) and [#285](https://github.com/slackapi/bolt-js/issues/285))- thanks [@shanedewael](https://github.com/shanedewael) 
- Fixes a bug with custom receiver being overwritten when `signingSecret` was passed into constructor ([#271](https://github.com/slackapi/bolt-js/issues/271)) - thanks [@shanedewael](https://github.com/shanedewael) 
- Adds a maintainer guide ([#272](https://github.com/slackapi/bolt-js/issues/272)) - thanks [@shanedewael](https://github.com/shanedewael) 
- Fixes a JA documentation inconsistency ([#273](https://github.com/slackapi/bolt-js/issues/273)) - thanks [@ikenami](https://github.com/ikenami) 


[Changes][@slack/bolt@1.4.0]


<a name="@slack/bolt@1.3.0"></a>
# [@slack/bolt@1.3.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@1.3.0) - 25 Sep 2019

- Adds new `view()` method that allows you to listen to `view_submission` events - thanks [@shanedewael](https://github.com/shanedewael)
- Adds new types and documentation for using Block Kit in modals - thanks [@shanedewael](https://github.com/shanedewael)
- Fix the Web API documentation - thanks [@PerStirpes](https://github.com/PerStirpes)

[Changes][@slack/bolt@1.3.0]


<a name="@slack/bolt@1.2.0"></a>
# [@slack/bolt@1.2.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@1.2.0) - 24 May 2019

* Adds support for `rawBody` in signature verification which enables serverless (GCP) deployments of Bolt  (fixes [#192](https://github.com/slackapi/bolt-js/issues/192)) - thanks [@seratch](https://github.com/seratch) 
* Fixes message action support (fixes [#201](https://github.com/slackapi/bolt-js/issues/201)) - thanks [@shanedewael](https://github.com/shanedewael) 
* Adds improvements to `App.spec.js` - thanks [@seratch](https://github.com/seratch)

[Changes][@slack/bolt@1.2.0]


<a name="@slack/bolt@1.1.0"></a>
# [@slack/bolt@1.1.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@1.1.0) - 20 May 2019

* Bolt will now fail with an error on initialization when it is started using an incompatible Node version ([#174](https://github.com/slackapi/bolt-js/issues/174)) - thanks [@aoberoi](https://github.com/aoberoi)
* Bug fix: `subtype()` built-in middleware used an inverted logical condition ([#180](https://github.com/slackapi/bolt-js/issues/180)) - thanks [@shanedewael](https://github.com/shanedewael)
* Bug fix: Errors from calling `say()` utility were not handled using the global error handler ([#183](https://github.com/slackapi/bolt-js/issues/183)) - thanks [@sethlu](https://github.com/sethlu) and [@aoberoi](https://github.com/aoberoi)
* Bug fix: The `conversationContext()` default built-in middleware did not allow events without a channel context to flow through handlers ([#185](https://github.com/slackapi/bolt-js/issues/185)) - thanks [@aoberoi](https://github.com/aoberoi)
* Bug fix: The `matchMessage()` and `directMention()` built-in middleware would fail to process messages without `text`, such as Block Kit composed messages ([#182](https://github.com/slackapi/bolt-js/issues/182)) - thanks [@aoberoi](https://github.com/aoberoi)
* Tons of improvements to the Getting Started guide, and other docs ([#170](https://github.com/slackapi/bolt-js/issues/170), [#171](https://github.com/slackapi/bolt-js/issues/171), [#177](https://github.com/slackapi/bolt-js/issues/177), [#178](https://github.com/slackapi/bolt-js/issues/178), [#181](https://github.com/slackapi/bolt-js/issues/181), [#186](https://github.com/slackapi/bolt-js/issues/186), [#188](https://github.com/slackapi/bolt-js/issues/188), [#193](https://github.com/slackapi/bolt-js/issues/193), [#194](https://github.com/slackapi/bolt-js/issues/194)) - thanks [@shanedewael](https://github.com/shanedewael), [@0xflotus](https://github.com/0xflotus), and [@seratch](https://github.com/seratch).

[Changes][@slack/bolt@1.1.0]


<a name="@slack/bolt@1.0.1"></a>
# [@slack/bolt@1.0.1](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@1.0.1) - 24 Apr 2019

- Fix block action detection and removes `StringIndexed` from action body types ([#166](https://github.com/slackapi/bolt-js/issues/166)) - thanks [@aoberoi](https://github.com/aoberoi) 
- Fail early for unknown constraints ([#167](https://github.com/slackapi/bolt-js/issues/167)) - thanks [@aoberoi](https://github.com/aoberoi) 

[Changes][@slack/bolt@1.0.1]


<a name="@slack/bolt@1.0.0"></a>
# [Introducing Bolt - v1.0.0 (@slack/bolt@1.0.0)](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@1.0.0) - 24 Apr 2019

Bolt is a framework for building Slack apps, _fast_.

[Get started](/getting-started) to build your team's next productivity enhancer, social sidekick, or just have some fun with memes. Bolt makes it a cinch listen in on the Events API, send [composed messages](https://api.slack.com/messaging), respond to [interactions in those messages](https://api.slack.com/messaging/interactivity), and more.

Get more details in the [full documentation](https://slack.dev/bolt).

### Where is Slapp?

Bolt wouldn't be possible without all the amazing work from Slapp contributors and community - it evolved from the Slapp codebase. Slapp will continue to be supported on the [`v3` branch](https://github.com/slackapi/bolt/tree/v3) but we'd really like existing Slapp users to give Bolt a try. We've been mindful to make sure Slapp apps will translate over without too much pain, and will be publishing a migration guide in the future.

[Changes][@slack/bolt@1.0.0]


<a name="@slack/bolt@v1.0.0-alpha.0"></a>
# [@slack/bolt@v1.0.0-alpha.0](https://github.com/slackapi/bolt-js/releases/tag/@slack/bolt@v1.0.0-alpha.0) - 24 Apr 2019



[Changes][@slack/bolt@v1.0.0-alpha.0]


[@slack/bolt@3.19.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.18.0...@slack/bolt@3.19.0
[@slack/bolt@3.18.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.17.1...@slack/bolt@3.18.0
[@slack/bolt@3.17.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.17.0...@slack/bolt@3.17.1
[@slack/bolt@3.17.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.16.0...@slack/bolt@3.17.0
[@slack/bolt@3.16.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.15.0...@slack/bolt@3.16.0
[@slack/bolt@3.15.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.14.0...@slack/bolt@3.15.0
[@slack/bolt@3.14.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.13.3...@slack/bolt@3.14.0
[@slack/bolt@3.13.3]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.13.2...@slack/bolt@3.13.3
[@slack/bolt@3.13.2]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.13.1...@slack/bolt@3.13.2
[@slack/bolt@3.13.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.13.0...@slack/bolt@3.13.1
[@slack/bolt@3.13.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@4.0.0-nextGen.9...@slack/bolt@3.13.0
[@slack/bolt@4.0.0-nextGen.9]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.12.2...@slack/bolt@4.0.0-nextGen.9
[@slack/bolt@3.12.2]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@4.0.0-nextGen.8...@slack/bolt@3.12.2
[@slack/bolt@4.0.0-nextGen.8]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@4.0.0-nextGen.6...@slack/bolt@4.0.0-nextGen.8
[@slack/bolt@4.0.0-nextGen.6]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@4.0.0-nextGen.3...@slack/bolt@4.0.0-nextGen.6
[@slack/bolt@4.0.0-nextGen.3]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@4.0.0-nextGen.2...@slack/bolt@4.0.0-nextGen.3
[@slack/bolt@4.0.0-nextGen.2]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.12.1...@slack/bolt@4.0.0-nextGen.2
[@slack/bolt@3.12.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.12.0...@slack/bolt@3.12.1
[@slack/bolt@3.12.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.11.3...@slack/bolt@3.12.0
[@slack/bolt@3.11.3]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.11.2...@slack/bolt@3.11.3
[@slack/bolt@3.11.2]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.11.1...@slack/bolt@3.11.2
[@slack/bolt@3.11.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.11.0...@slack/bolt@3.11.1
[@slack/bolt@3.11.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.10.0...@slack/bolt@3.11.0
[@slack/bolt@3.10.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.9.0...@slack/bolt@3.10.0
[@slack/bolt@3.9.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.8.1...@slack/bolt@3.9.0
[@slack/bolt@3.8.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.8.0...@slack/bolt@3.8.1
[@slack/bolt@3.8.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.7.0...@slack/bolt@3.8.0
[@slack/bolt@3.7.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.6.0...@slack/bolt@3.7.0
[@slack/bolt@3.6.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.6.0-hermesBeta.1...@slack/bolt@3.6.0
[@slack/bolt@3.6.0-hermesBeta.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.5.0...@slack/bolt@3.6.0-hermesBeta.1
[@slack/bolt@3.5.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.4.1...@slack/bolt@3.5.0
[@slack/bolt@3.4.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.4.0...@slack/bolt@3.4.1
[@slack/bolt@3.4.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.3.0...@slack/bolt@3.4.0
[@slack/bolt@3.3.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.2.0...@slack/bolt@3.3.0
[@slack/bolt@3.2.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.1.1...@slack/bolt@3.2.0
[@slack/bolt@3.1.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.1.0...@slack/bolt@3.1.1
[@slack/bolt@3.1.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@3.0.0...@slack/bolt@3.1.0
[@slack/bolt@3.0.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.7.0...@slack/bolt@3.0.0
[@slack/bolt@2.7.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.6.0...@slack/bolt@2.7.0
[@slack/bolt@2.6.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.5.0...@slack/bolt@2.6.0
[@slack/bolt@2.5.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.4.1...@slack/bolt@2.5.0
[@slack/bolt@2.4.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.4.0...@slack/bolt@2.4.1
[@slack/bolt@2.4.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.3.0-workflowStepsBeta.1...@slack/bolt@2.4.0
[@slack/bolt@2.3.0-workflowStepsBeta.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.3.0...@slack/bolt@2.3.0-workflowStepsBeta.1
[@slack/bolt@2.3.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.2.3-workflowStepsBeta.1...@slack/bolt@2.3.0
[@slack/bolt@2.2.3-workflowStepsBeta.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.2.0...@slack/bolt@2.2.3-workflowStepsBeta.1
[@slack/bolt@2.2.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.1.1-workflowStepsBeta.1...@slack/bolt@2.2.0
[@slack/bolt@2.1.1-workflowStepsBeta.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@1.8.1...@slack/bolt@2.1.1-workflowStepsBeta.1
[@slack/bolt@1.8.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.1.1...@slack/bolt@1.8.1
[@slack/bolt@2.1.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.1.0...@slack/bolt@2.1.1
[@slack/bolt@2.1.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.0.1...@slack/bolt@2.1.0
[@slack/bolt@2.0.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@2.0.0...@slack/bolt@2.0.1
[@slack/bolt@2.0.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@1.8.0...@slack/bolt@2.0.0
[@slack/bolt@1.8.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@1.7.0...@slack/bolt@1.8.0
[@slack/bolt@1.7.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@1.6.0...@slack/bolt@1.7.0
[@slack/bolt@1.6.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@1.5.0...@slack/bolt@1.6.0
[@slack/bolt@1.5.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@1.4.1...@slack/bolt@1.5.0
[@slack/bolt@1.4.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@1.4.0...@slack/bolt@1.4.1
[@slack/bolt@1.4.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@1.3.0...@slack/bolt@1.4.0
[@slack/bolt@1.3.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@1.2.0...@slack/bolt@1.3.0
[@slack/bolt@1.2.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@1.1.0...@slack/bolt@1.2.0
[@slack/bolt@1.1.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@1.0.1...@slack/bolt@1.1.0
[@slack/bolt@1.0.1]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@1.0.0...@slack/bolt@1.0.1
[@slack/bolt@1.0.0]: https://github.com/slackapi/bolt-js/compare/@slack/bolt@v1.0.0-alpha.0...@slack/bolt@1.0.0
[@slack/bolt@v1.0.0-alpha.0]: https://github.com/slackapi/bolt-js/tree/@slack/bolt@v1.0.0-alpha.0

<!-- Generated by https://github.com/rhysd/changelog-from-release v3.7.2 -->
