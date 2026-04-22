# Maintainers Guide

This document describes tools, tasks and workflow that one needs to be familiar with in order to effectively maintain
this project. If you use this package within your own software as is but don't plan on modifying it, this guide is
**not** for you.

## Tools

All you need to work with this project is a supported version of [Node.js](https://nodejs.org/en/)
(see `package.json` field "engines") and npm (which is distributed with Node.js).

## Tasks

### Testing

#### Unit Tests

This package has unit tests for most files in the same directory the code is in with the suffix `.spec` (i.e. `exampleFile.spec.ts`). You can run the entire test suite using the npm script `npm test`. This command is also executed by GitHub Actions, the continuous integration service, for every Pull Request and branch. The coverage is computed with the `codecov` package. The tests themselves are run using the `mocha` test runner.

Test code should be written in syntax that runs on the oldest supported Node.js version. This ensures that backwards compatibility is tested and the APIs look reasonable in versions of Node.js that do not support the most modern syntax.

#### Debugging

A useful trick for debugging inside tests is to use the Chrome Debugging Protocol feature of Node.js to set breakpoints and interactively debug. In order to do this you must run mocha directly. This means that you should have already linted the source (`npm run lint`), manually. You then run the tests using the following command: `./node_modules/.bin/mocha test/{test-name}.js --debug-brk --inspect` (replace {test-name} with an actual test file).

#### Local Development

Using in progress changes made to this package in an app can be useful for development.
Use the pack command to package the Bolt for Javascript project:

```sh
npm pack
```

Install the `slack-bolt-*.tgz` to an app to use your changes:

```sh
npm install path/to/bolt-js/slack-bolt-*.tgz
```

The packaged build includes dependencies published with Bolt for JavaScript, including required peer dependencies but not devDependencies, to imitate actual installations.

Remove cached project dependencies with `rm -r node_modules package-lock.json` between those steps to keep the cache clean.

### Managing Documentation

If you're not touching the `/docs` folder, you don't need to worry about the docs setup affecting your PR.

The `/docs` folder contains two types of docs files:

- markdown files
- sidebar.json

The private repo containing the docs.slack.dev site pulls these in at build time.

Maintainers need to use the `run workflow` button associated with the `deploy` workflow in that private repo to update the docs with changes from here.

#### Markdown Files

The markdown files here are secretly mdx files in disguise.

If you'd like to add images to pages, add the image files to the same folder the md file is in.

We appreciate markdown edits from anyone!!!

#### Sidebar

`_sidebar.json` sets the Bolt JS docs sidebar

Sidebar values take the form of `bolt-js/path-within-docs/`.

or, in other words - full path but remove "docs":
path: `bolt-js/docs/concepts/sending-variables.md`
value: `bolt-js/concepts/sending-variables`

For info on syntax see https://docusaurus.io/docs/sidebar.

This file is copied to slackapi.github.io/bolt-js/\_sidebar.json, then called in slackapi.github.io/sidebars.js

### 🎁 Updating Changesets

This project uses [Changesets](https://github.com/changesets/changesets) to track changes and automate releases.

Each changeset describes a change to the package and its [semver](https://semver.org/) impact, and a new changeset should be added when updating the package with some change that affects consumers:

```sh
npm run changeset
```

Updates to documentation, tests, or CI might not require new entries.

When a PR containing changesets is merged to `main`, a different PR is opened or updated using [changesets/action](https://github.com/changesets/action) which consumes the pending changesets, bumps the package version, and updates the `CHANGELOG` in preparation to release.

### 🚀 Releases

Releasing can feel intimidating at first, but don't fret! If you make a mistake, npm allows you to unpublish within the first 72 hours. The one catch is that you can't reuse the same version number. Venture on!

> For beta releases, read the [**Beta Releases**](#beta-release) section below.

New official package versions are published when the release PR created from changesets is merged and the publish workflow is approved. Follow these steps to build confidence:

1. **Check GitHub Milestones**: Before merging the release PR please check the relevant [Milestones](https://github.com/slackapi/bolt-js/milestones). If issues or pull requests are still open either decide to postpone the release or save those changes for a future update.

2. **Review the release PR**: Verify that the version bump matches expectations, `CHANGELOG` entries are clear, and CI checks pass. Use `npm install` to update versions in the `package-lock.json` file.

3. **Merge and approve**: Merge the release PR, then approve the publish workflow to release the package to npm.

4. **Update Milestones**: Close the relevant [Milestones](https://github.com/slackapi/bolt-js/milestones) and rename these to match the released package version. Open a new Milestone for the next version, e.g. `@slack/bolt@next`.

5. **Communicate the release**:
   - **External**: Post in relevant channels (e.g. #lang-javascript, #tools-bolt) on [Slack Community](https://community.slack.com/). Include a link to the package on `npmjs.com/package/@slack/bolt` as well as the release notes.

#### Beta Release

Beta releases are currently a manual process since [Changesets pre-releases](https://github.com/changesets/changesets/blob/main/docs/prereleases.md) add significant workflow complexity.

1. Create a feature branch off of `main` (e.g. `feat-the-feature` or `2.5.0rc`) and ensure it has the latest changes from `main` via rebase or merge.

2. On the feature branch, bump the version and commit:

   ```sh
   npm version 2.1.1-workflowStepsBeta.1 --no-git-tag-version
   git add package.json
   git commit -m "chore(release): version 2.1.1-workflowStepsBeta.1"
   ```

3. Tag and push the branch to origin:

   ```sh
   git tag @slack/bolt@2.1.1-workflowStepsBeta.1
   git push origin feat-the-feature @slack/bolt@2.1.1-workflowStepsBeta.1
   ```

4. Publish to npm with a non-`latest` dist-tag:

   ```sh
   npm publish --tag <dist-tag> --otp YOUR_OTP_CODE
   ```

   Verify with `npm info @slack/bolt dist-tags`. If `latest` was accidentally overwritten:

   ```sh
   npm dist-tag add @slack/bolt@VERSION latest --otp YOUR_OTP_CODE
   ```

5. (Optional) Create a [GitHub Release](https://github.com/slackapi/bolt-js/releases/new) and mark it as a **pre-release**. Release notes should mention contributors and issues/PRs.
   - Example release: https://github.com/slackapi/bolt-js/releases/tag/%40slack%2Fbolt%402.1.1-workflowStepsBeta.1

## Workflow

### Versioning and Tags

This project is versioned using [Semantic Versioning](http://semver.org/), particularly in the
[npm flavor](https://docs.npmjs.com/getting-started/semantic-versioning). Each release is tagged
using git.

### Fork

As a maintainer, the development you do will be almost entirely off of your forked version of this repository. The exception to this rule pertains to multiple collaborators working on the same feature, which is detailed in the **Branches** section below.

### Branches

`main` is where active development occurs.

When developing, branches should be created off of your fork and not directly off of this repository. If working on a long-running feature and in collaboration with others, a corresponding branch of the same name is permitted. This makes collaboration on a single branch possible, as contributors working on the same feature cannot push commits to others' open Pull Requests.

After a major version increment, there also may be maintenance branches created specifically for supporting older major versions.

### Issue Management

Labels are used to run issues through an organized workflow. Here are the basic definitions:

- `bug`: A confirmed bug report. A bug is considered confirmed when reproduction steps have been documented and the issue has been reproduced.
- `enhancement`: A feature request for something this package might not already do.
- `docs`: An issue that is purely about documentation work.
- `tests`: An issue that is purely about testing work.
- `needs feedback`: An issue that may have claimed to be a bug but was not reproducible, or was otherwise missing some information.
- `discussion`: An issue that is purely meant to hold a discussion. Typically the maintainers are looking for feedback in this issues.
- `question`: An issue that is like a support request because the user's usage was not correct.
- `semver:major|minor|patch`: Metadata about how resolving this issue would affect the version number.
- `security`: An issue that has special consideration for security reasons.
- `good first contribution`: An issue that has a well-defined relatively-small scope, with clear expectations. It helps when the testing approach is also known.
- `duplicate`: An issue that is functionally the same as another issue. Apply this only if you've linked the other issue by number.

**Triage** is the process of taking new issues that aren't yet "seen" and marking them with a basic
level of information with labels. An issue should have **one** of the following labels applied:
`bug`, `enhancement`, `question`, `needs feedback`, `docs`, `tests`, or `discussion`.

Issues are closed when a resolution has been reached. If for any reason a closed issue seems
relevant once again, reopening is great and better than creating a duplicate issue.

## Everything else

When in doubt, find the other maintainers and ask.
