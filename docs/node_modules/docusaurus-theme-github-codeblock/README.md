Docusaurus Theme GitHub Codeblock ![Test Changes](https://github.com/christian-bromann/docusaurus-theme-github-codeblock/workflows/Test%20Changes/badge.svg?branch=main)
=================================

A Docusaurus plugin that supports referencing code examples from public GitHub repositories.

> Note: this theme plugin supports Docusaurus [v2](https://docusaurus.io/docs/2.x) and [v3](https://docusaurus.io/docs).

## Install

First, add the theme plugin to your dependencies:

```sh
npm install docusaurus-theme-github-codeblock
```

## Usage

Add the theme plugin to your list of themes in the `docusaurus.config.js`:

```js
    // ...
    themes: [
        'docusaurus-theme-github-codeblock'
    ],
    // ...
    themeConfig: {
        // github codeblock theme configuration
        codeblock: {
            showGithubLink: true,
            githubLinkLabel: 'View on GitHub',
            showRunmeLink: false,
            runmeLinkLabel: 'Checkout via Runme'
        },
        // ...
    }
    // ...
```

To reference GitHub snippets in your markdown, create code blocks with a `reference` attached to the language meta string and put the link to your GitHub reference in the code block, e.g.:

    ```js reference
    https://github.com/christian-bromann/docusaurus-theme-github-codeblock/blob/main/src/theme/ReferenceCodeBlock/index.tsx#L105-L108
    ```

You can also set a custom title:

    ```js reference title="Example"
    https://github.com/christian-bromann/docusaurus-theme-github-codeblock/blob/main/src/theme/ReferenceCodeBlock/index.tsx#L105-L108
    ```

The plugin will download the code and display the desired lines:

![Plugin Example](https://github.com/christian-bromann/docusaurus-theme-github-codeblock/raw/main/.github/assets/example.png 'Plugin Example')

### Runme Support

In addition to providing a link to the GitHub source, you can also enable a [Runme](https://runme.dev) link to allow users to easily check-out the example markdown file with [VS Code](https://code.visualstudio.com/) and run the code reference locally. To enable support, set `showRunmeLink` to `true` in your Docusaurus `themeConfig`.

By default the Runme link is generated based on the repository and it will checkout a `README.md` in the same directory as the file. For example using the example above, Runme will checkout the repository `christian-bromann/docusaurus-theme-github-codeblock` and the file `src/theme/ReferenceCodeBlock/README.md`.

If the markdown file you like the user to check-out is located in a different repository or path, you can define the `repository` and `fileToOpen` param of [Runme link](https://stateful.com/blog/runme-blog-launcher) manually via, e.g.:

    ```js reference runmeRepository="git@github.com:christian-bromann/docusaurus-theme-github-codeblock.git" runmeFileToOpen="CONTRIBUTING.md"
    https://github.com/christian-bromann/docusaurus-theme-github-codeblock/blob/main/src/theme/ReferenceCodeBlock/index.tsx#L105-L115
    ```

In case you have `showRunmeLink` set for all code references, if you prefer to clone the reference using a Git HTTPS url, add `useHTTPS` to the frontmatter:

    ```js reference useHTTPS
    https://github.com/christian-bromann/docusaurus-theme-github-codeblock/blob/main/src/theme/ReferenceCodeBlock/index.tsx#L105-L108
    ```

Learn more about Runme in the [project docs](https://runme.dev/docs/intro).

## Options

This Docusaurus theme has the following options:

### `showGithubLink`

If set to `true` the link to the GitHub source of the reference is provided.

__Type:__ `boolean`<br />
__Default:__ `true`

### `githubLinkLabel`

Link text for GitHub link.

__Type:__ `string`<br />
__Default:__ `View on GitHub`

### `showRunmeLink`

If set to `true`, a [Runme](https://runme.dev) link is provided. This property will be automatically set to `false` if a mobile environment is detected given these environment don't support the `vscode://` url schema.

__Type:__ `boolean`<br />
__Default:__ `true`

### `runmeLinkLabel`

Link text for [Runme](https://runme.dev) link.

__Type:__ `string`<br />
__Default:__ `Checkout via Runme`

---

If you are interested in contributing to this project, see [CONTRIBUTING.md](CONTRIBUTING.md).
