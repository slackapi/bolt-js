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

See the [`/docs/README.md`](../docs/README.md) file for documentation instructions.

If you're not touching the `/docs` folder, you don't need to worry about the docs setup affecting your PR.

### Releases
_For beta releases, see Beta Releases section below:_

Releasing can feel intimidating at first, but rest assured: if you make a mistake, don't fret! npm allows you to unpublish a release within the first 72 hours of publishing (you just won’t be able to use the same version number again). Venture on!

1. Check the status of the package's GitHub Milestone for issues that should be shipped with the release.
    -  If all issues have been closed, continue with the release.
    -  If issues are still open, discuss with the team about whether the open issues should be moved to a future release or if the release should be held off until the issues are resolved.
    -  Take a look at all issues under the Milestone to make sure that the type of issues included aligns with the Milestone name based on [semantic versioning](https://semver.org/). If the issues do not align with the naming of the Milestone (ex: if the issues are all bug fixes, but the Milestone is labeled as a minor release), then you can tweak the Milestone name to reflect the correct versioning.

2. Make sure your local `main` branch has the latest changes.
    - Run `git rebase main` from your feature branch (this will rebase your feature branch from `main`). You can opt for `git merge main` if you are not comfortable with rebasing.
    - If you do not have a feature branch, you can also use generic release candidate branch name like `<next-version>rc`, i.e. `2.5.0rc`.

3. Bump the version number in adherence to [Semantic Versioning](http://semver.org/) in `package.json`. (see [Versioning and Tags](https://github.com/slackapi/node-slack-sdk/blob/main/.github/maintainers_guide.md#versioning-and-tags))
    - The version must be in the format of `Major.Minor.Patch-BetaNamespace.BetaVersion` (ex: `5.10.0-workflowStepsBeta.1`, `2.5.0-rc.1`)
    -  Update any dependency versions in `package.json` and install locally `rm -r node_modules package-lock.json && npm install`
    -  Confirm tests pass and code is free of linting errors by running `npm test`.
    -  Make a single commit with a message for the version bump ([Example](https://github.com/slackapi/bolt-js/pull/1133/commits/bcc421cd05b50ddcdeb806fcb27a38d7d9f8ede8)).
    - Create a pull request for the version change ([Example](https://github.com/slackapi/bolt-js/pull/1133))
    - Add appropriate labels on the PR, including `release`
4. Once the PR has been approved and tests have passed, merged to main repository.
    -  Check out your local `main` branch and update it to get the latest changes: `git checkout main && git pull origin main`
    -  Add a version tag (ie, `git tag @slack/bolt@3.6.0`)
    -  Push the new tag up to origin: `git push --tags origin`
5. Publish the release to npm
    - To publish, you need to be a member of the `slack Org` on npm and set up 2-Factor Auth with your password generator of choice. Before you can publish with npm, you must run `npm login` from the command line.
    - Before publishing a new version, run `rm -rf node_modules/ dist/` to clean your module dependencies in the project first (usually this is not required but in some cases, `npm publish` cannot include all the required files in a package) 
    - Just in case, run `npm i && npm test && npm pack` and check if the list of the files that will be included in the package contain, at a minimum: `package.json`, `README.md`, `LICENSE`, `dist/index.js`, `dist/App.js`
    - Publish the release by running `npm publish --tag <dist-tag> . --otp YOUR_OTP_CODE`.
        - Stable releases should use `latest` for the `<dist-tag>`. This label is reserved only for the latest non-beta release!
        - Beta releases should use a representative label for `<dist-tag>`. It could be feature-specific (e.g. `feat-token-rotation`) or it can be a generic release candidate (e.g. `2.5.0rc`). As long as it's _not_ `latest`.
        - All current dist tags can be viewed by running `npm info`.
        - An OTP (One Time Password) can be generated for `YOUR_OTP_CODE` with the password generator of your choice (Duo, 1Password).
6. Close GitHub Milestone
    - Close the relevant GitHub Milestone(s) for the release(s)
    - Check the existing GitHub Milestones to see if the next minor version exists. If it doesn't, then create a GitHub Milestone for new issues to live in. Typically, you'll create a new minor version - however, if there are any bugs that need to be carried over from the current GitHub Milestone, you could make a Milestone for a patch version to reflect those issues
    - Move any unfinished, open issues to the next GitHub Milestone
7. Create GitHub Release(s) with release notes
    - From the repository, navigate to the **Releases** section and draft a new release
    - When creating the release notes, select the tag you generated earlier for your release and title the release the same name as the tag
    - Release notes should mention contributors, issues and PRs ([Example](https://github.com/slackapi/bolt-js/releases/tag/%40slack%2Fbolt%403.13.2))
        - Related changes should be grouped together, such as enhancements, bug fixes, documentation, dependencies, or others.
    - Once the release notes are ready, click the "Publish Release" button to make them public

8. Communicate the release (as appropriate)
    - **Internal**
      - Include a brief description and link to the GitHub release
    - **External**
      - **community.slack.com**: Post updates in relevant channels (e.g. #lang-javascript, #tools-bolt)
      - **Twitter**: Primarily for major updates. Coordinate with Developer Marketing.


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
