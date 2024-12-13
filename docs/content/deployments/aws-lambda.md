---
title: Deploying to AWS Lambda
lang: en
---

This guide walks you through preparing and deploying a Slack app using Bolt for JavaScript, the [Serverless Framework](https://serverless.com/), and [AWS Lambda](https://aws.amazon.com/lambda/).

When you’re finished, you’ll have this ⚡️[Deploying to AWS Lambda app](https://github.com/slackapi/bolt-js/tree/main/examples/deploy-aws-lambda) to run, modify, and make your own.

---

## Set up AWS Lambda {#set-up-aws-lambda}

[AWS Lambda](https://aws.amazon.com/lambda/) is a serverless, Function-as-a-Service (FaaS) platform that allows you to run code without managing servers. In this section, we'll configure your local machine to access AWS Lambda.

:::tip 

Skip this section if you have already [configured a profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-profiles) on your local machine to access AWS Lambda.

:::

### 1. Sign up for an AWS account

If you don't already have an account, you should [sign up for AWS](https://aws.amazon.com/) and follow the on-screen instructions.

:::info 

You may be asked for payment information during the sign up. Don't worry, this guide only uses the [free tier](https://aws.amazon.com/lambda/pricing/).

:::

### 2. Create an AWS access key

Next, you'll need programmatic access to your AWS account to deploy onto Lambda. In the world of AWS, this requires an **Access Key ID** and **Secret Access Key**.

We recommend watching this short, step-by-step video to 🍿 [create an IAM user and download the access keys](https://www.youtube.com/watch?v=KngM5bfpttA).

:::tip[Do you already have an IAM user?] 

Follow the official AWS guide to [create access keys for existing IAM users](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-creds).

:::

### 3. Install the AWS CLI

The AWS tools are available as a Command Line Interface (CLI) and can be [installed on macOS, Windows, or Linux](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html).

On macOS, you can install the AWS CLI by [downloading the latest package installer](https://awscli.amazonaws.com/AWSCLIV2.pkg).

### 4. Configure an AWS profile

You can use the AWS CLI to configure a profile that stores your access key pair on your local machine. This profile is used by the CLI and other tools to access AWS.

The quickest way to [configure your profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-config) is to run this command and follow the prompts:

```zsh
aws configure
# AWS Access Key ID [None]: <your-aws-access-key>
# AWS Secret Access Key [None]: <your-aws-secret>
# Default region name [None]: us-east-1
# Default output format [None]: json
```

:::tip 

Customize the [region](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-region) and [output format](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-format) best for you.

:::

That wraps up configuring your local machine to access AWS. 👏 Next, let's do the same with the Serverless Framework.

---

## Set up Serverless Framework {#set-up-serverless-framework}

The [Serverless Framework](https://serverless.com/) includes tools that let you easily configure, debug, and deploy your app to AWS Lambda.

The Serverless tools are available as a Command Line Interface (CLI) and can be installed on macOS, Windows, or Linux. Check out the [Serverless Getting Started documentation](https://www.serverless.com/framework/docs/getting-started/) for instructions on how to install.

Once the installation is complete, test the Serverless CLI by displaying the commands available to you:

```shell
serverless help
```

You're now set up with the Serverless tools! Let's move on to preparing your Bolt app to run as an AWS Lambda function.

---

## Get a Bolt Slack app {#get-a-bolt-slack-app}

If you haven't already built your own Bolt app, you can use our [Getting Started guide](/getting-started) or clone the template app below:

```shell
git clone https://github.com/slackapi/bolt-js-getting-started-app.git
```

After you have a Bolt app, navigate to its directory:

```shell
cd bolt-js-getting-started-app/
```

Now that you have an app, let's prepare it for AWS Lambda and the Serverless Framework.

---

## Prepare the app {#prepare-the-app}

### 1. Prepare the app for AWS Lambda

By default, our Bolt Getting Started app sample is configured to use SocketMode. Let's update the setup in `app.js` to have our app listen for HTTP requests instead.

```javascript
// Initializes your app with your bot token
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true, // delete this line
  appToken: process.env.SLACK_APP_TOKEN, // delete this line
});
```

Next, we'll customize your Bolt app's [`receiver`](/concepts/receiver) to respond to Lambda function events.

Update the [source code that imports your modules](https://github.com/slackapi/bolt-js-getting-started-app/blob/4c29a21438b40f0cbca71ece0d39b356dfcf88d5/app.js#L1) in `app.js` to require Bolt's AwsLambdaReceiver:

```javascript
const { App, AwsLambdaReceiver } = require('@slack/bolt');
```

:::warning

If implementing authentication with OAuth, you must use the [`ExpressReceiver`](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts). Please note that when using `ExpressReceiver`, the `processBeforeResponse: true` property is required during initialization to avoid latency issues.

:::

Then update the [source code that initializes your Bolt app](https://github.com/slackapi/bolt-js-getting-started-app/blob/4c29a21438b40f0cbca71ece0d39b356dfcf88d5/app.js#L10-L14) to create a custom receiver using AwsLambdaReceiver:

```javascript
// Initialize your custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver: awsLambdaReceiver,

    // When using the AwsLambdaReceiver, processBeforeResponse can be omitted.
    // If you use other Receivers, such as ExpressReceiver for OAuth flow support
    // then processBeforeResponse: true is required. This option will defer sending back
    // the acknowledgement until after your handler has run to ensure your handler
    // isn't terminated early by responding to the HTTP request that triggered it.

    // processBeforeResponse: true

});
```

Finally, at the bottom of your app, update the [source code that starts the HTTP server](https://github.com/slackapi/bolt-js-getting-started-app/blob/main/app.js#L47-L52) to now respond to an AWS Lambda function event:

```javascript
// Handle the Lambda function event
module.exports.handler = async (event, context, callback) => {
    const handler = await awsLambdaReceiver.start();
    return handler(event, context, callback);
}
```

When you're done, your app should look similar to the ⚡️[Deploying to AWS Lambda app](https://github.com/slackapi/bolt-js/tree/main/examples/deploy-aws-lambda/app.js).

### 2. Add a serverless.yml

Serverless Framework projects use a `serverless.yml` file to configure and deploy apps.

Create a new file called `serverless.yml` in your app's root directory and paste the following:

```yaml
service: serverless-bolt-js
frameworkVersion: '3'
provider:
  name: aws
  runtime: nodejs14.x
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

:::info 

`SLACK_SIGNING_SECRET` and `SLACK_BOT_TOKEN` must be environment variables on your local machine.

You can [learn how to export Slack environment variables](/getting-started#setting-up-your-project) in our Getting Started guide.

:::

### 3. Install Serverless Offline

To make local development a breeze, we'll use the `serverless-offline` module to emulate a deployed function.

Run the following command to install it as a development dependency:

```bash
npm install --save-dev serverless-offline
```

Congratulations, you've just prepared your Bolt app for AWS Lambda and Serverless! Now let's run and deploy your app.

---

## Run the app locally {#run-the-app-locally}

Now that your app is configured to respond to an AWS Lambda function, we'll set up your environment to run the app locally.

### 1. Start your local servers

First, use the `serverless offline` command to start your app and listen to AWS Lambda function events:

```zsh
serverless offline --noPrependStageInUrl
```

:::tip 

You can make code changes to your app in one terminal while running the above command in another terminal, and as you save code changes your app will reload automatically.

:::

Next, use ngrok to forward Slack events to your local machine:

```zsh
ngrok http 3000
```

:::info 

[Learn how to use ngrok](/getting-started#setting-up-events) to create a public URL and forward requests to your local machine.

:::

### 2. Update your Request URL

Next, visit your [Slack app's settings](https://api.slack.com/apps) to update your **Request URL** to use the ngrok web address.

Your **Request URL** ends with `/slack/events`, such as `https://abc123.ngrok.io/slack/events`.

First, select **Interactivity & Shortcuts** from the side and update the **Request URL**:

![Interactivity & Shortcuts page](/img/interactivity-and-shortcuts-page.png "Interactivity & Shortcuts page")

Second, select **Event Subscriptions** from the side and update the **Request URL**:

![Event Subscriptions page](/img/event-subscriptions-page.png "Event Subscriptions page")

### 3. Test your Slack app

Now you can test your Slack app by inviting your app to a channel then saying “hello” (lower-case). Just like in the [Getting Started guide](/getting-started), your app should respond back:

```
> 👩‍💻 hello
```

```
> 🤖 Hey there @Jane!
```

If you don’t receive a response, check your **Request URL** and try again.

:::info[How does this work?]

The ngrok and Serverless commands are configured on the same port (default: 3000). When a Slack event is sent to your **Request URL**, it's received on your local machine by ngrok. The request is then forwarded to Serverless Offline, which emulates an AWS Lambda function event and triggers your Bolt app's receiver. 🛫🛬 Phew, what a trip!

:::

---

## Deploy the app {#deploy-the-app}

In the previous section of this tutorial, you ran your app locally and tested it in a live Slack workspace. Now that you have a working app, let's deploy it!

You can use the Serverless Framework tools to provision, package, and deploy your app onto AWS Lambda. After your app is deployed, you'll need to update your app's request URL to say "hello" to your app. ✨

### 1. Deploy the app to AWS Lambda

Now, deploy your app to AWS Lambda with the following command:

```shell
serverless deploy
# Serverless: Packaging service...
# ...
# endpoints:
#   POST - https://atuzelnkvd.execute-api.us-east-1.amazonaws.com/dev/slack/events
# ...
```

After your app is deployed, you'll be given an **endpoint** which you'll use as your app's **Request URL**. The **endpoint** should end in `/slack/events`. Go ahead and copy this **endpoint** to use in the next section.

### 2. Update your Slack app's settings

Now we need to use your AWS Lambda **endpoint** as your **Request URL**, which is where Slack will send events and actions.
With your endpoint copied, navigate to your [Slack app's configuration](https://api.slack.com/apps) to update your app's **Request URLs**.

First, select **Interactivity & Shortcuts** from the side and update the **Request URL**:

![Interactivity & Shortcuts page](/img/interactivity-and-shortcuts-page.png "Interactivity & Shortcuts page")

Second, select **Event Subscriptions** from the side and update the **Request URL**:

![Event Subscriptions page](/img/event-subscriptions-page.png "Event Subscriptions page")

### 3. Test your Slack app

Your app is now deployed and Slack is updated, so let's try it out!

Just like the [running the app locally](#run-the-app-locally) section, open a Slack channel that your app is in and say "hello". You app should once again respond with a greeting:

```
> 👩‍💻 hello
```

```
> 🤖 Hey there @Jane!
```

### 4. Deploy an update

As you continue to build your Slack app, you'll need to deploy the updates. Let's get a feel for this by updating your app to respond to a "goodbye" message.

Add the following code to `app.js` ([source code on GitHub](https://github.com/slackapi/bolt-js/tree/main/examples/deploy-aws-lambda/app.js)):

```javascript
// Listens to incoming messages that contain "goodbye"
app.message('goodbye', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`See ya later, <@${message.user}> :wave:`);
});
```

Deploy the update using the same command as before:

```shell
serverless deploy
```

When the deploy is complete, you can open a Slack channel that your app has joined and say "goodbye" (lower-case). You should see a friendly farewell from your Slack app.

:::tip 

If you are making small changes to single functions, you can deploy only a single function using `serverless deploy function -f my-function` which is much faster. Run `serverless help deploy function` for more detailed help.

:::

---

## Next steps {#next-steps}

You just deployed your first ⚡️[Bolt for JavaScript app to AWS Lambda](https://github.com/slackapi/bolt-js/tree/main/examples/deploy-aws-lambda)! 🚀

Now that you've built and deployed a basic app, here are some ideas you can explore to extend, customize, and monitor it:

- Brush up on [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) and the [Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/guide/intro/).
- Extend your app with other Bolt capabilities and [Serverless plugins](https://www.serverless.com/framework/docs/providers/aws/guide/plugins/).
- Learn about [logging](/concepts/logging) and how to [view log messages with Serverless](https://www.serverless.com/framework/docs/providers/aws/cli-reference/logs/).
- Get ready for primetime with AWS Lambda [testing](https://www.serverless.com/framework/docs/providers/aws/guide/testing/) and [deployment environments](https://www.serverless.com/framework/docs/providers/aws/guide/deploying/).