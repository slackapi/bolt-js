# Maintainers Guide

This document describes tools, tasks and workflow that one needs to be familiar with in order to effectively maintain
this project. If you use this package within your own software as is but don't plan on modifying it, this guide is
**not** for you.

## Tools

All you need to work with this project is a supported version of [Node.js](https://nodejs.org/en/)
(see `package.json` field "engines") and npm (which is distributed with Node.js).

## Tasks

### Testing

This package has unit tests for most files in the same directory the code is in with the suffix `.spec` (i.e. `exampleFile.spec.ts`). You can run the entire test suite using the npm script `npm test`. This command is also executed by Travis, the continuous integration service, for every Pull Request and branch. The coverage is computed with the `codecode` package. The tests themselves are run using the `mocha` test runner.

Test code should be written in syntax that runs on the oldest supported Node.js version. This ensures that backwards compatibility is tested and the APIs look reasonable in versions of Node.js that do not support the most modern syntax.

A useful trick for debugging inside tests is to use the Chrome Debugging Protocol feature of Node.js to set breakpoints and interactively debug. In order to do this you must run mocha directly. This means that you should have already linted the source (`npm run lint`), manually. You then run the tests using the following command: `./node_modules/.bin/mocha test/{test-name}.js --debug-brk --inspect` (replace {test-name} with an actual test file).

### Generating Documentation

The documentation is built using [Jekyll](https://jekyllrb.com/) and hosted with GitHub Pages.
The source files are contained in the `docs` directory. They are broken up into the `_basic`, `_advanced`, and `_tutorials` directories depending on content's nature.

All documentation contains [front matter](https://jekyllrb.com/docs/front-matter/) that indicates the section's title, slug (for header), respective language, and if it's not a tutorial it contains the order it should appear within it's respective section (basic or advanced).

To build the docs locally, you can run `bundle exec jekyll serve`.

#### Adding beta documentation
When documentation is in a beta state, it requires a new, distinct collection of docs. The process is a little nuanced, so make sure to build the documentation locally to make sure it appears how you expect. To create a new collection:
1. Add content
* Add a new folder to docs with an underscore (ex: `_steps`).
* Add documentation sections to that folder, with similar front matter to the `_advanced` and `_basic` sections.
* Add an overview section that explains the beta state of the category. This should always be `order: 1` in the front matter.

2. Configure layout
* Update `docs`>`_config.yml` with the new collection you created under `collections` (the same as the folder name - ex: `steps`). While you're there, add the sidebar title under `t`.
* In `docs`>`_layouts`>`default.html` make a copy of the `basic` or `advanced` section, and modify the div ID and content to correspond to your beta collection. This step requires you to use variables from `_config.yml`.
* Now in `docs`>`_includes`>`sidebar.html`, create a new section after the basic and advanced sections. Again, copy the `basic` or `advanced` section to use as a template. Be careful with the variable naming—it's a little more complex than in `default.html`, and requires you to use variables from `_config.yml`.

### Releasing

1.  Create the commit for the release:
    *  Bump the version number in adherence to [Semantic Versioning](http://semver.org/) in `package.json`.
    *  Update any dependency versions 
    *  Confirm tests pass by running `npm test`
    *  Commit with a message including the new version number. For example `v2.2.0`.
    *  Tag the commit with the version number. For example `git tag @slack/bolt@2.2.0`.

2.  Merge into main repository
    *  Create a pull request with the commit that was just made. Be certain to include the tag. For
       example: `git push username main --tags`.
    *  Once tests pass and a reviewer has approved, merge the pull request. You will also want to
       update your local `main` branch.
    *  Push the new tag up to origin `git push --tags origin`.

3.  Distribute the release
    *  Publish to the package manager. Once you have permission to publish on npm, you can run `npm publish . --otp YOUR_OTP_CODE`.
    *  Create a GitHub Release with release notes. Release notes should mention contributors (@-mentions) and issues/PRs (#-mentions) for the release.
    *  Example release: https://github.com/slackapi/bolt/releases/tag/%40slack%2Fbolt%401.5.0

4.  (Slack Internal) Communicate the release internally. Include a link to the GitHub Release.

5.  Announce on community.slack.com in #slack-api

#### Beta Release

1. Create the commit for the release:
    * Follow normal release steps above for creating a release with a few minor changes:
        *  Set version to the format of `Major.Minor.Patch-BetaNameSpace-BetaVersion` (example: `2.1.1-workflowStepsBeta.1`)

2. Merge into feature branch on origin
    * Push commit + git tag to origin. example: `git push origin feat-the-feature && git push --tags origin`

3. Distribute the release
    *  Publish to the package manager. Once you have permission to publish on npm, you can run `npm publish . --otp YOUR_OTP_CODE`.
        * Update `latest` dist-tag on npm back to the last non beta release `npm dist-tag add @slack/bolt@VERSION latest --otp YOUR-OTP-CODE`
        * Add a new dist-tag for your feature. `npm dist-tag add @slack/bolt@VERSION-BetaNameSpace-BetaVersion feat-the-feature --otp YOUR-OTP-CODE`
    *  Create a GitHub Release with release notes. Release notes should mention contributors (@-mentions) and issues/PRs (#-mentions) for the release. Make sure to check the pre release option.
    *  Example release: https://github.com/slackapi/bolt-js/releases/tag/%40slack%2Fbolt%402.1.1-workflowStepsBeta.1


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

*  `bug`: A confirmed bug report. A bug is considered confirmed when reproduction steps have been
   documented and the issue has been reproduced.
*  `enhancement`: A feature request for something this package might not already do.
*  `docs`: An issue that is purely about documentation work.
*  `tests`: An issue that is purely about testing work.
*  `needs feedback`: An issue that may have claimed to be a bug but was not reproducible, or was otherwise missing some information.
*  `discussion`: An issue that is purely meant to hold a discussion. Typically the maintainers are looking for feedback in this issues.
*  `question`: An issue that is like a support request because the user's usage was not correct.
*  `semver:major|minor|patch`: Metadata about how resolving this issue would affect the version number.
*  `security`: An issue that has special consideration for security reasons.
*  `good first contribution`: An issue that has a well-defined relatively-small scope, with clear expectations. It helps when the testing approach is also known.
*  `duplicate`: An issue that is functionally the same as another issue. Apply this only if you've linked the other issue by number.

**Triage** is the process of taking new issues that aren't yet "seen" and marking them with a basic
level of information with labels. An issue should have **one** of the following labels applied:
`bug`, `enhancement`, `question`, `needs feedback`, `docs`, `tests`, or `discussion`.

Issues are closed when a resolution has been reached. If for any reason a closed issue seems
relevant once again, reopening is great and better than creating a duplicate issue.

## Everything else

When in doubt, find the other maintainers and ask.