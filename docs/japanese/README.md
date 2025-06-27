# Bolt for JavaScript Japanese documentation

This README describes how the Japanese documentation is created.

[Docusaurus](https://docusaurus.io) supports using different languages. Each language is a different version of the same site. The English site is the default. The English page will be viewable if the page is not translated into Japanese. You do not need to place the English page on the Japanese side of the site though! It is automatically pulled during the build process. 

There will be English pages on the Japanese site of the pages are not translated yet. Japanese readers will not miss any content, but they may be confused seeing English and Japanese mixed together. Please give us your thoughts on this setup.

Because it will use the English page if there is not a matching Japanese page, the sidebar does not need to be updated for the Japanese documentation. It's always the same as the English documentation!
---

## Japanese documentation files 

Below is an example tree of English and Japanese docs.

```
docs/
├── english/
│   ├── example-page.md 
│   ├── getting-started.md
│   └── concepts
│       └── sending-message.md
├── japanese/
│   ├── getting-started.md
│   └── concepts
│       └── sending-message.md
```

If the file is not in `docs/japanese`, then the English file will be used. In the example above, `example-page.md` is not in `docs/japanese`. Therefore, the English version of `example-page.md` will appear on the Japanese site. 

The Japanese page file formats must be the same as the English page files in `docs/content/`. Please keep the file names in English (example: `sending-message.md`). 

Please provide a title in Japanese. It will show up in the sidebar. There are two ways to provide a title:

```
---
title: こんにちは
---

# こんにちは

```

[Read the Docusaurus documentation for info on writing pages in markdown](https://docusaurus.io/docs/markdown-features).