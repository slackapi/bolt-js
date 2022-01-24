import { ViewsOpenResponse } from '@slack/web-api';
import { View } from '@slack/types';
import { Middleware } from '../middleware';
import { SayFn, AckFn } from '../utilities';

/* Notification Subscription :: 0 - Base */
export interface NotificationSubscription<T extends string = string> {
  type: T;
  token: string;
  action_ts: string;
  action_id: string;
  user: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    domain: string;
    enterprise_id?: string; // exists for enterprise installs
    enterprise_name?: string; // exists for enterprise installs
  };
}

/* Notification Subscription :: 1 - Create Requested */
export interface SubscriptionCreateRequested extends NotificationSubscription<'notification_subscription_create_requested'> {
  channel: {
    id: string; // id of channel where request was initiated
  };
  notification_subscription_action_trigger_id: string;
  notification_subscription: {
    resource_link: string;
  };
}

/* Notification Subscription :: 2 - Configure Requested */
export interface SubscriptionConfigureRequested extends NotificationSubscription<'notification_subscription_configure_requested'> {
  notification_subscription_action_trigger_id: string;
  notification_subscription: {
    id: string; // slack generated id of notification subscription
  };
}

/* Notification Subscription :: 3 - Deleted */
export interface SubscriptionDeleted extends NotificationSubscription<'notification_subscription_deleted'> {
  notification_subscription: {
    id: string; // slack generated id of notification subscription
  };
}

export type SubscriptionInteraction =
  SubscriptionCreateRequested |
  SubscriptionConfigureRequested |
  SubscriptionDeleted;

/**
  * Utility mixin for middlewares to open a configuration modal view (views.open)
*/
export interface UseConfigure {
  configure: {
    (params: View): Promise<ViewsOpenResponse>
  };
}
/**
 * Utility mixin for middlewares which can be used to send a message to the user
 * */
export interface UseSay {
  say: SayFn;
}
/**
 * Values and utilities middlewares receive in order to process incoming notification
 * subscription interactive payloads.
 * */
export interface SubscriptionMiddlewareArgs<S extends SubscriptionInteraction = SubscriptionInteraction> {
  payload: S;
  body: S;
  /* TODO: Confirm void is the correct type arg to pass
  * */
  ack: AckFn<void>;
}
export interface SubscriptionOnCreateMiddlewareArgs extends SubscriptionMiddlewareArgs, UseConfigure, UseSay {}
export interface SubscriptionOnConfigureMiddlewareArgs extends SubscriptionMiddlewareArgs, UseConfigure {}
export type SlackSubscriptionMiddlewareArgs =
SubscriptionMiddlewareArgs |
SubscriptionOnCreateMiddlewareArgs |
SubscriptionOnConfigureMiddlewareArgs;

/**
 * Types for middleware which handle notification subscription interaction
 * payloads defined above
 * */
export type SubscriptionOnCreateMiddleware = Middleware<SubscriptionOnCreateMiddlewareArgs>;
export type SubscriptionOnConfigureMiddleware = Middleware<SubscriptionOnConfigureMiddlewareArgs>;
export type SubscriptionOnDeletedMiddleware = Middleware<SubscriptionMiddlewareArgs>;

export interface SubConfigureFn {
  (params: View): Promise<ViewsOpenResponse>;
}
