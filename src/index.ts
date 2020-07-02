const packageJson = require('../package.json'); // tslint:disable-line:no-require-imports no-var-requires
import pleaseUpgradeNode from 'please-upgrade-node';

pleaseUpgradeNode(packageJson);

console.log('Bolt v1.x has been deprecated. Please upgrade to Bolt v2.x. Migration guide available at https://slack.dev/bolt-js/tutorial/migration-v2.');

export {
  default as App,
  AppOptions,
  Authorize,
  AuthorizeSourceData,
  AuthorizeResult,
  AuthorizationError,
  ActionConstraints,
  LogLevel,
  Logger,
} from './App';

export { ErrorCode } from './errors';

export {
  default as ExpressReceiver,
  ExpressReceiverOptions,
} from './ExpressReceiver';

export * from './middleware/builtin';
export * from './types';

export {
  ConversationStore,
  MemoryStore,
} from './conversation-store';
