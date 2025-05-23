import type { FunctionExecutedEvent, SlackEvent } from '@slack/types';
import type { FunctionCompleteFn, FunctionFailFn } from '../../CustomFunction';
import type { AckFn, SayFn, StringIndexed } from '../utilities';

export type SlackEventMiddlewareArgsOptions = { autoAcknowledge: boolean };

/**
 * Arguments which listeners and middleware receive to process an event from Slack's Events API.
 */
export type SlackEventMiddlewareArgs<EventType extends string = string> = {
  payload: EventFromType<EventType>;
  event: EventFromType<EventType>;
  body: EnvelopedEvent<EventFromType<EventType>>;
} & (EventType extends 'message'
  ? // If this is a message event, add a `message` property
    { message: EventFromType<EventType> }
  : unknown) &
  (EventFromType<EventType> extends { channel: string } | { item: { channel: string } }
    ? // If this event contains a channel, add a `say` utility function
      { say: SayFn }
    : unknown) &
  (EventType extends 'function_executed'
    ? {
        inputs: FunctionExecutedEvent['inputs'];
        complete: FunctionCompleteFn;
        fail: FunctionFailFn;
        ack: AckFn<void>;
      }
    : {
        // Add `ack` as undefined for global middleware in TypeScript TODO: but why? spend some time digging into this
        ack?: undefined;
      });

export interface BaseSlackEvent<T extends string = string> {
  type: T;
}
export type EventTypePattern = string | RegExp;
export type FunctionInputs = Record<string, unknown>;

/**
 * A Slack Events API event wrapped in the standard envelope.
 *
 * This describes the entire JSON-encoded body of a request from Slack's Events API.
 */
export interface EnvelopedEvent<Event = BaseSlackEvent> extends StringIndexed {
  token: string;
  team_id: string;
  enterprise_id?: string;
  api_app_id: string;
  event: Event;
  type: 'event_callback';
  event_id: string;
  event_time: number;
  is_ext_shared_channel?: boolean;
  authorizations?: Authorization[];
}

interface Authorization {
  enterprise_id: string | null;
  team_id: string | null;
  user_id: string;
  is_bot: boolean;
  is_enterprise_install?: boolean;
}

/**
 * Type function which given a string `T` returns a type for the matching Slack event(s).
 *
 * When the string matches known event(s) from the `SlackEvent` union, only those types are returned (also as a union).
 * Otherwise, the `BasicSlackEvent<T>` type is returned.
 */
export type EventFromType<T extends string> = KnownEventFromType<T> extends never
  ? BaseSlackEvent<T>
  : KnownEventFromType<T>;
export type KnownEventFromType<T extends string> = Extract<SlackEvent, { type: T }>;

/**
 * Type function which tests whether or not the given `Event` contains a channel ID context for where the event
 * occurred, and returns `Type` when the test passes. Otherwise this returns `undefined`.
 */
