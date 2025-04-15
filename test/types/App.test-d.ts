import { Agent } from 'node:http';
import { ConsoleLogger, LogLevel } from '@slack/logger';
import type { Installation, InstallationQuery } from '@slack/oauth';
import { expectAssignable, expectError, expectType } from 'tsd';
import App from '../../src/App';

expectAssignable<App>(
  new App({
    token: 'xoxb-example',
    signingSecret: 'secretpassword',
  }),
);

expectAssignable<App>(
  new App({
    token: 'xoxb-example',
    socketMode: true,
    appToken: 'xapp-example',
  }),
);

expectAssignable<App>(
  new App({
    logLevel: LogLevel.DEBUG,
    signingSecret: 'secretpassword',
    clientId: '0123456789',
    clientSecret: 'randomvalues',
    stateSecret: 'hidden',
    scopes: ['chat:write'],
    installationStore: {
      storeInstallation: async <AuthVersion extends 'v1' | 'v2'>(installation: Installation<AuthVersion, boolean>) => {
        expectType<Installation<AuthVersion, boolean>>(installation);
      },
      fetchInstallation: async (query) => {
        expectType<InstallationQuery<boolean>>(query);
        return {
          user: { token: undefined, scopes: [], id: 'U0123456789' },
          bot: { token: 'xoxb-example', scopes: ['chat:write'], id: 'B0123456789', userId: 'U0101010101' },
          team: { id: 'T0123456789' },
          enterprise: undefined,
        };
      },
      deleteInstallation: async (query) => {
        expectType<InstallationQuery<boolean>>(query);
      },
    },
  }),
);

expectAssignable<App>(
  new App({
    clientOptions: {
      agent: new Agent(),
      allowAbsoluteUrls: false,
      logger: new ConsoleLogger(),
      retryConfig: {
        forever: true,
      },
      slackApiUrl: 'http://localhost:8080/api/',
    },
  }),
);

expectError(new App({ password: 'randomish!' }));
