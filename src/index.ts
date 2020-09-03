import pleaseUpgradeNode from 'please-upgrade-node';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJson = require('../package.json'); // eslint-disable-line @typescript-eslint/no-var-requires

pleaseUpgradeNode(packageJson);

export {
  default as App,
  AppOptions,
  Authorize,
  AuthorizeSourceData,
  AuthorizeResult,
  ActionConstraints,
  LogLevel,
  Logger,
} from './App';

export { default as ExpressReceiver, ExpressReceiverOptions } from './ExpressReceiver';

export * from './errors';
export * from './middleware/builtin';
export * from './types';

export { ConversationStore, MemoryStore } from './conversation-store';

export {
  Installation,
  InstallURLOptions,
  InstallationQuery,
  InstallationStore,
  StateStore,
  InstallProviderOptions,
} from '@slack/oauth';

export * from '@slack/types';
