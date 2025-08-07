[@slack/bolt](../index.md) / InstallProviderOptions

# Interface: InstallProviderOptions

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:6

## Properties

### authorizationUrl?

```ts
optional authorizationUrl: string;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:22

The slack.com authorize URL

***

### authVersion?

```ts
optional authVersion: "v1" | "v2";
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:64

The default is "v2" (a.k.a. Granular Bot Permissions), different from "v1" (a.k.a. "Classic Apps").
More details here:
- https://medium.com/slack-developer-blog/more-precision-less-restrictions-a3550006f9c3
- https://api.slack.com/authentication/migration

***

### clientId

```ts
clientId: string;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:10

Client ID, which can be found under the Basic Information section of your application on https://api.slack.com/apps

***

### clientOptions?

```ts
optional clientOptions: Omit<WebClientOptions, "logLevel" | "logger">;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:80

The customization options for WebClient

***

### clientSecret

```ts
clientSecret: string;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:14

Client Secret, which can be found under the Basic Information section of your application on https://api.slack.com/apps

***

### directInstall?

```ts
optional directInstall: boolean;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:57

The install path web page rendering will be skipped if true (default: false)

***

### installationStore?

```ts
optional installationStore: InstallationStore;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:18

Manages installation data, which can be called by both the OAuth flow and authorize() in event handling

***

### installUrlOptions?

```ts
optional installUrlOptions: InstallURLOptions;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:68

The initialization options for the OAuth flow

***

### legacyStateVerification?

```ts
optional legacyStateVerification: boolean;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:41

handleCallback() skips checking browser cookies if true (default: false)
Enabling this option is not recommended.
This is supposed to be used only for backward-compatibility with v2.4 and olders.

***

### logger?

```ts
optional logger: Logger;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:72

@slack/logger logging used in this class

***

### logLevel?

```ts
optional logLevel: LogLevel;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:76

@slack/logger logging level used in this class

***

### renderHtmlForInstallPath()?

```ts
optional renderHtmlForInstallPath: (url) => string;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:53

The function for rendering the web page for the install path URL

#### Parameters

##### url

`string`

#### Returns

`string`

***

### stateCookieExpirationSeconds?

```ts
optional stateCookieExpirationSeconds: number;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:49

The expiration time in seconds for the state parameter value stored via cookies

***

### stateCookieName?

```ts
optional stateCookieName: string;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:45

The cookie name used for setting state parameter value in cookies

***

### stateSecret?

```ts
optional stateSecret: string;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:31

The secret value used for generating the state parameter value

***

### stateStore?

```ts
optional stateStore: StateStore;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:27

Stores state issued to authorization server
and verifies the value returned at redirection during OAuth flow to prevent CSRF

***

### stateVerification?

```ts
optional stateVerification: boolean;
```

Defined in: node\_modules/@slack/oauth/dist/install-provider-options.d.ts:35

handleCallback() verifies the state parameter if true (default: true)
