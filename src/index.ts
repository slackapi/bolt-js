const packageJson = require('../package.json'); // tslint:disable-line:no-require-imports no-var-requires
import pleaseUpgradeNode from 'please-upgrade-node';

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

export {
  default as ExpressReceiver,
  ExpressReceiverOptions,
} from './ExpressReceiver';

export * from './errors';
export * from './middleware/builtin';
export * from './receiver';
export * from './types';

export {
  ConversationStore,
  MemoryStore,
} from './conversation-store';
