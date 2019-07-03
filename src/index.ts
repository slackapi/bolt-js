import pleaseUpgradeNode from 'please-upgrade-node';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../package.json');

pleaseUpgradeNode(packageJson);

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
