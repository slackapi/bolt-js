/* eslint-disable @typescript-eslint/no-explicit-any */
import { View } from '@slack/types';
import processMiddleware from './middleware/process';
import {
  Middleware,
  AnyMiddlewareArgs,
  AllMiddlewareArgs,
} from './types';
import {
  SubscriptionOnCreateMiddleware,
  SubscriptionOnConfigureMiddleware,
  SubscriptionOnDeletedMiddleware,
  SlackSubscriptionMiddlewareArgs,
  SubConfigureFn,
  SubscriptionCreateRequested,
  SubscriptionConfigureRequested,
} from './types/subscription';

/* Interfaces */
export interface SubscriptionOptions {
  onCreate: SubscriptionOnCreateMiddleware[];
  onConfigure: SubscriptionOnConfigureMiddleware[];
  onDeleted?: SubscriptionOnDeletedMiddleware[];
}
/* Types */
type AllSubscriptionMiddlewareArgs<T extends SlackSubscriptionMiddlewareArgs = SlackSubscriptionMiddlewareArgs> =
T & AllMiddlewareArgs;

type SubscriptionMiddleware = SubscriptionOnCreateMiddleware[] |
SubscriptionOnConfigureMiddleware[] |
SubscriptionOnDeletedMiddleware[] | [];

/* Constants */
const VALID_NOTIFICATION_SUBSCRIPTION_INTERACTION_TYPES = [
  'notification_subscription_create_requested',
  'notification_subscription_configure_requested',
  'notification_subscription_deleted',
];
/**
 * Subscription describes a collection of named middlewares
 * for handling notification subscription related interaction
 * payloads.
 * */
export class Subscription {
  /**
   * @description The unique resource id for this Subscription.
   * */
  private id: string;

  /** Middleware to process :: 'notification_subscription_create_requested'
   *  interaction payload
   * */
  private onCreate: SubscriptionOnCreateMiddleware[];

  /** Middleware to process :: 'notification_subscription_configure_requested'
   * interaction payload
   * */
  private onConfigure: SubscriptionOnConfigureMiddleware[];

  /** Middleware to process :: 'notification_subscription_deleted' interaction
   * payload
   * */
  private onDeleted: SubscriptionOnDeletedMiddleware[] = [];

  public constructor(id: string, config: SubscriptionOptions) {
    validate(id, config);
    const { onCreate, onConfigure, onDeleted } = config;
    this.id = id;
    this.onCreate = Array.isArray(onCreate) ? onCreate : [onCreate];
    this.onConfigure = Array.isArray(onConfigure) ? onConfigure : [onConfigure];
    if (onDeleted !== undefined) {
      this.onDeleted = Array.isArray(onDeleted) ? onDeleted : [onDeleted];
    }
  }

  /* Utilities */
  public getMiddleware(): Middleware<AnyMiddlewareArgs> {
    return async (args): Promise<void> => {
      if (isSubscriptionInteraction(args) && this.matchesConstraints(args)) {
        return this.process(args);
      }
      return args.next();
    };
  }

  /**
   * `matchesConstraints()` implements any required constraints
   * on notification subscription interaction payloads.
   * */
  private matchesConstraints(args: AllSubscriptionMiddlewareArgs): boolean {
    // TODO :: implement constraint matching against custom action_id
    // when supported
    // If a custom action_id is provided, it should match the id of the Subscription
    // in order for proper middlewares to be invoked.
    return typeof this.id === 'string' && typeof args.payload.action_id === 'string';
  }

  private process = async (args: AllSubscriptionMiddlewareArgs): Promise<void> => {
    const { payload } = args;
    const subArgs = prepareSubArgs(args);
    const subMiddleware = this.getSubMiddleware(payload);
    return processSubMiddleware(subArgs, subMiddleware);
  };

  private getSubMiddleware = (payload: AllSubscriptionMiddlewareArgs['payload']): SubscriptionMiddleware => {
    switch (payload.type) {
      case 'notification_subscription_create_requested':
        return this.onCreate;
      case 'notification_subscription_configure_requested':
        return this.onConfigure;
      case 'notification_subscription_deleted':
        return this.onDeleted;
      default:
        return [];
    }
  };
}

/* Utilities */
function validate(id: string, config: SubscriptionOptions): void {
// id must be a string
  if (typeof id !== 'string') {
    // TODO: Create a custom error type for this and improve error messages
    throw new Error('Subscription id must be a string');
  }
  // Check user has supplied minimal required middleware
  const requiredKeys: (keyof SubscriptionOptions)[] = ['onCreate', 'onConfigure'];
  const missingKeys = requiredKeys.filter((key) => !(key in config));
  if (missingKeys.length > 0) {
    throw new Error(`Subcription handling options provided are missing required keys: ${missingKeys.join(', ')}`);
  }
  // Check user has supplied valid middleware
  const currentKeys = Object.keys(config) as (keyof SubscriptionOptions)[];
  currentKeys.forEach((fnKey) => {
    // must be non-falsy value
    if (!config[fnKey]) {
      throw new Error(`You must supply a middleware for ${fnKey}`);
    }
    // must be either a fn or array of fns
    if (typeof config[fnKey] !== 'function' && !Array.isArray(config[fnKey])) {
      throw new Error(`Subscription handling option ${fnKey} must be a function or an array of functions`);
    }
    // if array, it must contain fns
    if (Array.isArray(config[fnKey])) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      config[fnKey]!.forEach((ele) => {
        if (typeof ele !== 'function') {
          throw new Error(`If you provide an array for ${fnKey}, it must contain only functions`);
        }
      });
    }
  });
}

function isSubscriptionInteraction(args: AnyMiddlewareArgs): args is AllSubscriptionMiddlewareArgs {
  return VALID_NOTIFICATION_SUBSCRIPTION_INTERACTION_TYPES
    .includes(args.payload.type);
}

/**
 * `processSubMiddleware()` processes subscription interaction payload with the
 * middleware supplied by the user.
 * */
async function processSubMiddleware(
  args: AllSubscriptionMiddlewareArgs,
  origMiddleware: SubscriptionMiddleware,
): Promise<void> {
  const { context, client, logger } = args;
  // Copy the array so modifications don't affect the original
  const middlewares = [...origMiddleware] as Middleware<AnyMiddlewareArgs>[];
  // Don't process the last item in the array, it shouldn't get a next fn
  const lastCallback = middlewares.pop();
  if (lastCallback !== undefined) {
    await processMiddleware(
      middlewares, args, context, client, logger,
      async () => lastCallback({ ...args, context, client, logger }),
    );
  }
}
/**
 * `prepareSubArgs()` prepares the arguments for the specific middlewares
 * adding specific arguments for utilities
 * */
function prepareSubArgs(args: AllMiddlewareArgs): AllSubscriptionMiddlewareArgs {
  const { next: _next, ...subArgs } = args;
  const preparedArgs: any = { ...subArgs };
  switch (preparedArgs.payload.type) {
    case 'notification_subscription_create_requested':
      preparedArgs.configure = createConfigure(preparedArgs);
      break;
    case 'notification_subscription_configure_requested':
      preparedArgs.configure = createConfigure(preparedArgs);
      break;
    default:
      break;
  }
  return preparedArgs;
}

/**
 * Utility which returns a fxn which can be used to
 * open a configure view for configuring a Slack subscription
 * */
function createConfigure(args: any): SubConfigureFn {
  const { payload }: { payload: SubscriptionCreateRequested | SubscriptionConfigureRequested } = args;
  const trigger_id = payload.notification_subscription_action_trigger_id;
  const { client, context } = args;
  const token = context.botToken !== undefined ? context.botToken : context.userToken;
  return (view: View) => client.views.open({
    token,
    trigger_id,
    view,
  });
}
