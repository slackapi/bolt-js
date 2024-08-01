# slack.dev

This README describes how the Japanese documentation is created. Please read the [/docs README](./docs/README) for information on _all_ the documentation.

[Docusaurus](https://docusaurus.io) supports using different languages. Each language is a different version of the same site. Therefore, the Japanese documentation and English documentation must have the exact same pages.

If you add a page to the English documentation, then you must add the page to the Japanese documentation too. If you don't speak Japanese, copy the English documentation to the Japanese page. 

There will be English pages on the Japanese site if the pages are not translated yet. Japanese readers will not miss any content, but they may be confused seeing English and Japanese mixed together. Please give us your thoughts on this setup.

Because of this, the sidebar does not need to be updated for the Japanese documentation. It's always the same as the English documentation!

## Testing the Japanese site. 

Please read the [/docs README](./docs/README.md) for instructions. Be sure to run the site in Japanese:

```
npm run start -- --locale ja-jp
```

---

## Japanese documentation files

```
docs/
├── content/
│   ├── getting-started.md
│   └── concepts
│       └── sending-message.md
├── i18n/ja-jp
│   ├── code.json
│   ├── docusaurus-theme-classic/
│   │   ├── footer.json
│   │   └── navbar.json
│   └── docusaurus-plugin-content-docs/
│       └── current/
│           ├── getting-started.md
│           └── concepts
│               └── sending-message.md
```

The Japanese documentation is in `i18n/ja-jp/`. The folder contains `docusaurus-plugin-content-docs`, `docusaurus-theme-classic`, and `code.json`. 

### `docusaurus-plugin-content-docs`

```
docs/
├── content/ (English pages)
│   ├── getting-started.md
│   └── concepts
│       └── sending-message.md
├── i18n/ja-jp
│   └── docusaurus-plugin-content-docs/ 
│       └── current/ (Japanese pages)
│           ├── getting-started.md
│           └── concepts
│               └── sending-message.md
```

The Japanese page files in `i18n/ja-jp/docusaurus-plugin-content-docs/current/` must be the same as the English page files in `docs/content/`. Please keep the file names in English (example: `sending-message.md`)

Each page is a markdown file. If the page is not translated, it will be in English. Simply remove the English words and write Japanese to replace the page. 

Please provide a title in Japanese. It will show up in the sidebar. There are two options:

```
---
title: こんにちは
---

# こんにちは

```

[Read the Docusaurus documentation for info on writing pages in markdown](https://docusaurus.io/docs/markdown-features).

### `docusaurus-theme-classic`

```
└── i18n/ja-jp
    └── docusaurus-theme-classic/
        ├── footer.json
        └── navbar.json
```

`docusaurus-theme-classic` You can translate site components (footer and navbar) for the Japanese site. Each JSON object has a `messages` and `description` value:
    * `message` - The Japanese translation. It will be in English if not translated.
    * `description` - What and where the message is. This stays in English.

For example:

```
{
  "item.label.Hello": {
    "message": "こんにちは",
    "description": "The title of the page"
  }
}
```

The JSON files are created with the `npm run write-translations -- --locale ja-jp` command. [Please read the Docusaurus documentation](https://docusaurus.io/docs/i18n/tutorial#translate-your-react-code) for more info.

### `code.json`

```
└── i18n/ja-jp
    └── code.json
```

The `code.json` file is similar to `docusaurus-theme-classic` JSON objects. `code.json` has translations provided by Docusaurus for site elements. 

For example:

```
  "theme.CodeBlock.copy": {
    "message": "コピー",
    "description": "The copy button label on code blocks"
  },
```

Be careful changing `code.json`. If you change something in this repo, it will likely need to be changed in the other Slack.dev repos too, like the Bolt-Python repo. We want these translations to match for all Slack.dev sites. 