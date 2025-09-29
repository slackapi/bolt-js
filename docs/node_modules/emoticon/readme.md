# emoticon

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

List of emoticons.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`emoticon`](#emoticon-1)
*   [Types](#types)
*   [List of emoticons](#list-of-emoticons)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package contains info on ASCII emoticons.
:p

## When should I use this?

You can use this package for several reasons, typically in a build script,
for example to figure out which text emoticons map to what emoji.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install emoticon
```

In Deno with [Skypack][]:

```js
import {emoticon} from 'https://cdn.skypack.dev/emoticon@4?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import {emoticon} from 'https://cdn.skypack.dev/emoticon@4?min'
</script>
```

## Use

```js
import {emoticon} from 'emoticon'

console.log(emoticon.slice(0, 3))
```

Yields:

```js
[ { name: 'angry',
    emoji: '😠',
    tags: [ 'mad', 'annoyed' ],
    description: 'angry face',
    emoticons:
     [ '>:(', '>:[', '>:-(', '>:-[', '>=(', '>=[', '>=-(', '>=-[' ] },
  { name: 'blush',
    emoji: '😊',
    tags: [ 'proud' ],
    description: 'smiling face with smiling eyes',
    emoticons:
     [ ':")',
       ':"]',
       ':"D',
       ':-")',
       ':-"]',
       ':-"D',
       '=")',
       '="]',
       '="D',
       '=-")',
       '=-"]',
       '=-"D' ] },
  { name: 'broken_heart',
    emoji: '💔',
    tags: [],
    description: 'broken heart',
    emoticons: [ '<\\3', '</3' ] } ]
```

## API

This package exports the following identifier: `emoticon`.
There is no default export.

### `emoticon`

List of emoticons (`Array<Emoticon>`), where each entry has the following
fields:

*   `name` (`string`)
    — name of an emoticon (preferred name from [`wooorm/gemoji`][gemoji])
*   `emoji` (`string`)
    — corresponding emoji
*   `tags` (`Array<string>`)
    — associated tags (from [`wooorm/gemoji`][gemoji])
*   `description` (`string`)
    — associated description (from [`wooorm/gemoji`][gemoji])
*   `emoticons` (`Array<string>`)
    — ASCII emoticons

## Types

This package is fully typed with [TypeScript][].
It exports an additional `Emoticon` type that models its respective interface.

## List of emoticons

See [`support.md`][support].

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
It also works in Deno and modern browsers.

## Security

This package is safe.

## Related

*   [`wooorm/gemoji`][gemoji]
    — info on gemoji (GitHub emoji)
*   [`words/emoji-emotion`](https://github.com/words/emoji-emotion)
    — list of emoji rated for valence
*   [`wooorm/emoticon`](https://github.com/wooorm/emoticon)
    — info on ASCII emoticons
*   [`wooorm/strip-skin-tone`](https://github.com/wooorm/strip-skin-tone)
    — strip skin-tones from emoji
*   [`wooorm.com/checkmoji`](https://wooorm.com/checkmoji/)
    — check emoji across platforms

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/emoticon/workflows/main/badge.svg

[build]: https://github.com/wooorm/emoticon/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/emoticon.svg

[coverage]: https://codecov.io/github/wooorm/emoticon

[downloads-badge]: https://img.shields.io/npm/dm/emoticon.svg

[downloads]: https://www.npmjs.com/package/emoticon

[size-badge]: https://img.shields.io/bundlephobia/minzip/emoticon.svg

[size]: https://bundlephobia.com/result?p=emoticon

[npm]: https://docs.npmjs.com/cli/install

[skypack]: https://www.skypack.dev

[license]: license

[author]: https://wooorm.com

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/

[support]: support.md

[gemoji]: https://github.com/wooorm/gemoji
