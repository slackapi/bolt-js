---
title: AWS Lambda
order: 0
slug: aws-lambda
lang: en
layout: tutorial
permalink: /deployments/aws-lambda
---
# Deploying to AWS Lambda

<div class="section-content">
This guide walks you through preparing and deploying a Slack app using [Bolt for JavaScript][bolt-js], the [Serverless Framework][serverless-framework], and [AWS Lambda][aws-lambda].
</div>

When you’re finished, you’ll have this ⚡️[Deploying to AWS Lambda app][deploy-aws-lambda-app] to run, modify, and make your own.

---

### Set up AWS Lambda

[AWS Lambda][aws-lambda] is a serverless, Function-as-a-Service (FaaS) platform that allows you to run code without managing servers. In this section, we'll configure your local machine to access AWS Lambda.

> 💡 Skip this section if you have already [configured a profile][aws-profiles] on your local machine to access AWS Lambda.

**1. Sign up for an AWS account**

If you don't already have an account, you should [sign up for AWS][aws-sign-up] and follow the on-screen instructions.

> 💡 You may be asked for payment information during the sign up. Don't worry, this guide only uses the [free tier][aws-pricing].

**2. Create an AWS access key**

Next, you'll need programmatic access to your AWS account to deploy onto Lambda. In the world of AWS, this requires an **Access Key ID** and **Secret Access Key**.

We recommend watching this short, step-by-step video to 🍿 [create an IAM user and download the access keys](https://www.youtube.com/watch?v=KngM5bfpttA).

> 💡 **Do you already have an IAM user?** Follow the official AWS guide to [create access keys for existing IAM users][aws-iam-user].

**3. Install the AWS CLI**

The AWS tools are available as a Command Line Interface (CLI) and can be [installed on macOS, Windows, or Linux][aws-cli-install].

On macOS, you can install the AWS CLI by [downloading the latest package installer](https://awscli.amazonaws.com/AWSCLIV2.pkg).

**4. Configure an AWS profile**

You can use the AWS CLI to configure a profile that stores your access key pair on your local machine. This profile is used by the CLI and other tools to access AWS.

The quickest way to [configure your profile][aws-cli-configure] is to run this command and follow the prompts:

```zsh
aws configure
# AWS Access Key ID [None]: <your-aws-access-key>
# AWS Secret Access Key [None]: <your-aws-secret>
# Default region name [None]: us-east-1
# Default output format [None]: json
```

> 💡 Customize the [region][aws-cli-region] and [output format][aws-cli-output-format] best for you.

That wraps up configuring your local machine to access AWS. 👏 Next, let's do the same with the Serverless Framework.

---

### Set up Serverless Framework

The [Serverless Framework](https://www.serverless.com/open-source/) includes tools that let you easily configure, debug, and deploy your app to AWS Lambda.

**1. Install the Serverless Framework CLI**

The Serverless tools are available as a Command Line Interface (CLI) and can be [installed on macOS, Windows, or Linux](https://www.serverless.com/framework/docs/getting-started/). To install it using npm, run the following command:

```shell
npm install --save-dev serverless
```

> 💡 You can also [globally install the Serverless CLI](https://www.serverless.com/framework/docs/getting-started/) using the command `npm install -g serverless`.

Once the installation is complete, test the Serverless CLI by displaying the commands available to you:

```shell
npx serverless help
```

You're now set up with the Serverless tools! Let's move on to preparing your Bolt app to run as an AWS Lambda function.

---

### Get a Bolt Slack app

If you haven't already built your own Bolt app, you can use our [Getting Started guide][getting-started-guide] or clone the template app below:

```shell
git clone https://github.com/slackapi/bolt-js-getting-started-app.git
```

After you have a Bolt app, navigate to its directory:

```shell
cd bolt-js-getting-started-app/
```

Now that you have an app, let's prepare it for AWS Lambda and the Serverless Framework.

---

### Prepare the app

**1. Prepare the app for AWS Lambda**

By default, Bolt listens for HTTP requests. In this section, we'll customize your Bolt app's [`receiver`](https://slack.dev/bolt-js/concepts#receiver) to respond to Lambda function events instead.

First, install the official [AWS Serverless Express](https://github.com/awslabs/aws-serverless-express) module to transform Express HTTP requests to Lambda function events:

```bash
npm install aws-serverless-express
```

Next, update the [source code that imports your modules](https://github.com/slackapi/bolt-js-getting-started-app/blob/main/app.js#L1) in `app.js` to require Bolt's Express receiver and the AWS Serverless Express module:

```javascript
const { App, ExpressReceiver } = require('@slack/bolt');
const awsServerlessExpress = require('aws-serverless-express');
```

Then update the [source code that initializes your Bolt app](https://github.com/slackapi/bolt-js-getting-started-app/blob/main/app.js#L3-L7) to create a custom receiver using AWS Serverless Express:

```javascript
// Initialize your custom receiver
const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // The `processBeforeResponse` option is required for all FaaS environments.
  // It allows Bolt methods (e.g. `app.message`) to handle a Slack request
  // before the Bolt framework responds to the request (e.g. `ack()`). This is
  // important because FaaS immediately terminate handlers after the response.
  processBeforeResponse: true
});

// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver
});

// Initialize your AWSServerlessExpress server using Bolt's ExpressReceiver
const server = awsServerlessExpress.createServer(expressReceiver.app);
```

Finally, at the bottom of your app, update the [source code that starts the HTTP server](https://github.com/slackapi/bolt-js-getting-started-app/blob/main/app.js#L40-L45) to now respond to an AWS Lambda function event:

```javascript
// Handle the Lambda function event
module.exports.handler = (event, context) => {
  console.log('⚡️ Bolt app is running!');
  awsServerlessExpress.proxy(server, event, context);
};
```

When you're done, your app should look similar to the ⚡️[Deploying to AWS Lambda app][deploy-aws-lambda-app/app.js].

**2. Add a serverless.yml**

Serverless Framework projects use a `serverless.yml` file to configure and deploy apps.

Create a new file called `serverless.yml` in your app's root directory and paste the following:

```yaml
service: serverless-bolt-js
frameworkVersion: '2'
provider:
  name: aws
  runtime: nodejs12.x
  environment:
    SLACK_SIGNING_SECRET: ${env:SLACK_SIGNING_SECRET}
    SLACK_BOT_TOKEN: ${env:SLACK_BOT_TOKEN}
functions:
  slack:
    handler: app.handler
    events:
      - http:
          path: slack/events
          method: post
plugins:
  - serverless-offline
```

> 💡 `SLACK_SIGNING_SECRET` and `SLACK_BOT_TOKEN` must be enviornment variables on your local machine.
> You can [learn how to export Slack environment variables](/bolt-js/tutorial/getting-started#setting-up-your-local-project) in our Getting Started guide.

**3. Install Serverless Offline** 

To make local development a breeze, we'll use the `serverless-offline` module to emulate a deployed function.

Run the following command to install it as a development dependency:

```bash
npm install --save-dev serverless-offline
```

Congratulations, you've just prepared your Bolt app for AWS Lambda and Serverless! Now let's run and deploy your app.

---

### Run the app locally

Now that your app is configured to respond to an AWS Lambda function, we'll set up your environment to run the app locally.

**1. Start your local servers**

First, use the `serverless offline` command to listen for an AWS Lambda function event:

```zsh
npx serverless offline --noPrependStageInUrl
```

Next, use ngrok to forward Slack events to your local machine:

```zsh
ngrok http 3000
```

> 💡 [Learn how to use ngrok][getting-started-guide-setting-up-events] to create a public URL and forward requests to your local machine.

**2. Update your Request URL**

Next, visit your [Slack app's settings](https://api.slack.com/apps) to update your **Request URL** to use the ngrok web address.

> 💡 Your **Request URL** ends with `/slack/events`, such as `https://abc123.ngrok.io/slack/events`.

First, select **Interativity & Shortcuts** from the side and update the **Request URL**:

![Interactivity & Shortcuts page](../assets/interactivity-and-shortcuts-page.png "Interactivity & Shortcuts page")

Second, select **Event Subscriptions** from the side and update the **Request URL**:

![Event Subscriptions page](../assets/event-subscriptions-page.png "Event Subscriptions page")

**3. Test your Slack app**

Now you can test your Slack app by inviting your app to a channel then saying “hello” (lower-case). Just like in the [Getting Started guide][getting-started-guide], your app should respond back:

> 👩‍💻 hello<br/>
> 🤖 Hey there @Jane!

If you don’t receive a response, check your **Request URL** and try again.

> 💡 **How does this work?**
> The ngrok and Serverless commands are configured on the same port (default: 3000). When a Slack event is sent to your **Request URL**, it's received on your local machine by ngrok. The request is then forwarded to Serverless Offline, which emulates an AWS Lambda function event and triggers your Bolt app's receiver. 🛫🛬 Phew, what a trip!

---

### Deploy the app

You can use the Serverless Framework tools to provision, package, and deploy your app onto AWS Lambda. After your app is deployed, you'll need to update your app's request URL to say "hello" to your app. ✨

**1. Deploy the app to AWS Lambda**

Now, deploy your app to AWS Lambda with the following command:

```shell
npx serverless deploy
# Serverless: Packaging service...
# ...
# endpoints:
#   POST - https://atuzelnkvd.execute-api.us-east-1.amazonaws.com/dev/slack/events
# ...
```

After your app is deployed, you'll be given an **endpoint** which you'll use as your app's **Request URL**. Go ahead and copy this **endpoint** to use in the next section.

> 💡 The **endpoint** should end in `/slack/events`.

**2. Update your Slack app's settings**

Now we need to use your AWS Lambda **endpoint** as your **Request URL**, which is where Slack will send events and actions.
With your endpoint copied, navigate to your [Slack app's configuration](https://api.slack.com/apps) to update your app's **Request URLs**.

First, select **Interativity & Shortcuts** from the side and update the **Request URL**:

![Interactivity & Shortcuts page](../assets/interactivity-and-shortcuts-page.png "Interactivity & Shortcuts page")

Second, select **Event Subscriptions** from the side and update the **Request URL**:

![Event Subscriptions page](../assets/event-subscriptions-page.png "Event Subscriptions page")

**3. Test your Slack app**

Your app is now deployed and Slack is updated, so let's try it out!

Just like the [running the app locally](#run-the-app-locally) section, open a Slack channel that your app is in and say "hello". You app should once again respond with a greeting:

> 👩‍💻 hello<br/>
> 🤖 Hey there @Jane!

**4. Deploy an update**

As you continue to build your Slack app, you'll need to deploy the updates. Let's get a feel for this by updating your app to respond to a "goodbye" message.

Add the following code to `app.js` ([source code on GitHub][deploy-aws-lambda-app/app.js]):

```javascript
// Listens to incoming messages that contain "goodbye"
app.message('goodbye', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`See ya later, <@${message.user}> :wave:`);
});
```

Deploy the update using the same command as before:

```shell
npx serverless deploy
```

When the deploy is complete, you can open a Slack channel that your app has joined and say "goodbye" (lower-case). You should see a friendly farewell from your Slack app.

---

### Next steps

You just deployed your first ⚡️[Bolt for JavaScript app to AWS Lambda][deploy-aws-lambda-app]! 🚀

Now that you've built and deployed a basic app, here are some ideas you can explore to extend, customize, and monitor it:

- Brush up on [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) and the [Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/guide/intro/).
- Extend your app with [Bolt's Basic Concepts](/bolt-js/concepts#basic) and [Serverless plugins](https://www.serverless.com/framework/docs/providers/aws/guide/plugins/).
- Learn about logging in [Bolt's Advanced Concepts](/bolt-js/concepts#logging) and how to [view log messages with Serverless](https://www.serverless.com/framework/docs/providers/aws/cli-reference/logs/).
- Get ready for primetime with AWS Lambda [testing](https://www.serverless.com/framework/docs/providers/aws/guide/testing/) and [deployment environments](https://www.serverless.com/framework/docs/providers/aws/guide/deploying/).

[aws-cli-configure]: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-config
[aws-cli-install]: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
[aws-cli-output-format]: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-format 
[aws-cli-region]: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-region
[aws-iam-user]: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-creds
[aws-lambda]: https://aws.amazon.com/lambda/
[aws-pricing]: https://aws.amazon.com/lambda/pricing/
[aws-profiles]: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-profiles
[aws-sign-up]: https://aws.amazon.com/
[bolt-js]: /bolt-js
[deploy-aws-lambda-app]: https://github.com/slackapi/bolt-js/tree/main/examples/deploy-aws-lambda
[deploy-aws-lambda-app/app.js]: https://github.com/slackapi/bolt-js/tree/main/examples/deploy-aws-lambda/app.js
[getting-started-guide-setting-up-events]: https://slack.dev/bolt-js/tutorial/getting-started#setting-up-events
[getting-started-guide]: /bolt-js/tutorial/getting-started
[serverless-framework]: https://serverless.com/
