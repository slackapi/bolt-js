[@slack/bolt](../index.md) / StateStore

# Interface: StateStore

Defined in: node\_modules/@slack/oauth/dist/state-stores/interface.d.ts:22

Generates state parameter value in the OAuth flow.
While the state parameter value works for the CSRF protection purpose,
it can transfer the given InstallURLOptions value to the Redirect URL handler
(Redirect URL: the default path is "/slack/oauth_redirect")

## Properties

### generateStateParam()

```ts
generateStateParam: (installOptions, now) => Promise<string>;
```

Defined in: node\_modules/@slack/oauth/dist/state-stores/interface.d.ts:28

Generates a valid state parameter value, which can be decoded as a StateObj object
by the verifyStateParam() method. This value may be stored on the server-side with expiration.
The InstallProvider verifies if this value is set in the installer's browser session.

#### Parameters

##### installOptions

[`InstallURLOptions`](InstallURLOptions.md)

##### now

`Date`

#### Returns

`Promise`\<`string`\>

***

### verifyStateParam()

```ts
verifyStateParam: (now, state) => Promise<InstallURLOptions>;
```

Defined in: node\_modules/@slack/oauth/dist/state-stores/interface.d.ts:35

Verifies the given state string value by trying to decode the value and
build the passed InstallURLOptions object from the data.
This method verifies if the state value is not too old to detect replay attacks.
If the value is invalid, this method can throw InvalidStateError exception.

#### Parameters

##### now

`Date`

##### state

`string`

#### Returns

`Promise`\<[`InstallURLOptions`](InstallURLOptions.md)\>
