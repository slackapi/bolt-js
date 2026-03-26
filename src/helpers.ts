import type {
  AnyMiddlewareArgs,
  KnownEventFromType,
  MessageShortcut,
  OptionsSource,
  ReceiverEvent,
  SlackAction,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackOptionsMiddlewareArgs,
  SlackShortcutMiddlewareArgs,
} from './types';

/**
 * Internal data type for capturing the class of event processed in App#onIncomingEvent()
 */
export enum IncomingEventType {
  Event = 0,
  Action = 1,
  Command = 2,
  Options = 3,
  ViewAction = 4, // TODO: terminology: ViewAction? Why Action?
  Shortcut = 5,
}

// ----------------------------
// For skipping authorize with event

const eventTypesToSkipAuthorize = ['app_uninstalled', 'tokens_revoked'];

/**
 * Helper which finds the type and channel (if any) that any specific incoming event is related to.
 *
 * This is analogous to WhenEventHasChannelContext and the conditional type that checks SlackAction for a channel
 * context.
 */
// biome-ignore lint/suspicious/noExplicitAny: response bodies can be anything
export function getTypeAndConversation(body: any): { type?: IncomingEventType; conversationId?: string } {
  if (body.event !== undefined) {
    const { event } = body as SlackEventMiddlewareArgs<string>['body'];

    // Find conversationId
    const conversationId: string | undefined = (() => {
      let foundConversationId: string;
      if ('channel' in event) {
        if (typeof event?.channel === 'string') {
          foundConversationId = event.channel;
        } else if (typeof event?.channel === 'object' && 'id' in event.channel) {
          foundConversationId = event.channel.id;
        }
      }
      if ('channel_id' in event) {
        foundConversationId = event.channel_id;
      }
      if ('item' in event && 'channel' in event.item) {
        // no channel for reaction_added, reaction_removed, star_added, or star_removed with file or file_comment items
        foundConversationId = event.item.channel as string;
      }
      // Using non-null assertion (!) because the alternative is to use `foundConversation: (string | undefined)`, which
      // impedes the very useful type checker help above that ensures the value is only defined to strings, not
      // undefined. This is safe when used in combination with the || operator with a default value.
      // biome-ignore lint/style/noNonNullAssertion: TODO: revisit this and use the types
      return foundConversationId! || undefined;
    })();

    return {
      conversationId,
      type: IncomingEventType.Event,
    };
  }
  if (body.command !== undefined) {
    return {
      type: IncomingEventType.Command,
      conversationId: (body as SlackCommandMiddlewareArgs['body']).channel_id,
    };
  }
  if (body.name !== undefined || body.type === 'block_suggestion') {
    const optionsBody = body as SlackOptionsMiddlewareArgs<OptionsSource>['body'];
    return {
      type: IncomingEventType.Options,
      conversationId: optionsBody.channel !== undefined ? optionsBody.channel.id : undefined,
    };
  }
  // TODO: remove workflow_step stuff in v5
  if (body.actions !== undefined || body.type === 'dialog_submission' || body.type === 'workflow_step_edit') {
    const actionBody = body as SlackActionMiddlewareArgs<SlackAction>['body'];
    return {
      type: IncomingEventType.Action,
      conversationId: actionBody.channel !== undefined ? actionBody.channel.id : undefined,
    };
  }
  if (body.type === 'shortcut') {
    return {
      type: IncomingEventType.Shortcut,
    };
  }
  if (body.type === 'message_action') {
    const shortcutBody = body as SlackShortcutMiddlewareArgs<MessageShortcut>['body'];
    return {
      type: IncomingEventType.Shortcut,
      conversationId: shortcutBody.channel !== undefined ? shortcutBody.channel.id : undefined,
    };
  }
  if (body.type === 'view_submission' || body.type === 'view_closed') {
    return {
      type: IncomingEventType.ViewAction,
    };
  }
  return {};
}

/**
 * Helper which determines if the body of a request is enterprise install.
 *
 * Providing the type is optional but if you do the execution will be faster
 */
export function isBodyWithTypeEnterpriseInstall(body: AnyMiddlewareArgs['body'], type?: IncomingEventType): boolean {
  const _type = type !== undefined ? type : getTypeAndConversation(body).type;

  if (_type === IncomingEventType.Event) {
    const bodyAsEvent = body as SlackEventMiddlewareArgs['body'];
    if (Array.isArray(bodyAsEvent.authorizations) && bodyAsEvent.authorizations[0] !== undefined) {
      return !!bodyAsEvent.authorizations[0].is_enterprise_install;
    }
  }
  // command payloads have this property set as a string
  if (typeof body.is_enterprise_install === 'string') {
    return body.is_enterprise_install === 'true';
  }
  // all remaining types have a boolean property
  if (body.is_enterprise_install !== undefined) {
    return body.is_enterprise_install;
  }
  // as a fallback we assume it's a single team installation (but this should never happen)
  return false;
}

/**
 * Helper which determines if the event type will skip Authorize.
 *
 * Token revocation use cases
 * https://github.com/slackapi/bolt-js/issues/674
 */
export function isEventTypeToSkipAuthorize(event: ReceiverEvent): boolean {
  return eventTypesToSkipAuthorize.includes(event.body.event?.type);
}

/** Helper that should never be called, but is useful for exhaustiveness checking in conditional branches */
export function assertNever(x?: never): never {
  throw new Error(`Unexpected object: ${x}`);
}

/**
 * Extracts thread_ts from the event payload, checking common locations where it may appear.
 */
export function extractEventThreadTs<T extends string>(event: KnownEventFromType<T>): string | undefined {
  if (hasStringProperty(event, 'thread_ts')) {
    return event.thread_ts;
  }
  if ('assistant_thread' in event && hasStringProperty(event.assistant_thread, 'thread_ts')) {
    return event.assistant_thread.thread_ts;
  }
  if ('message' in event && hasStringProperty(event.message, 'thread_ts')) {
    return event.message.thread_ts;
  }
  if ('previous_message' in event && hasStringProperty(event.previous_message, 'thread_ts')) {
    return event.previous_message.thread_ts;
  }
  return undefined;
}

/**
 * Extracts the channel ID from the event payload, checking common locations where it may appear.
 *
 * TODO: When ready use this in getTypeAndConversation
 * Note: this intentionally prefers channel (string) > channel (object.id) > channel_id > item.channel > assistant_thread.channel_id,
 * which differs from getTypeAndConversation where channel_id overwrites channel. Align when consolidating.
 */
export function extractEventChannelId<T extends string>(event: KnownEventFromType<T>): string | undefined {
  if (hasStringProperty(event, 'channel')) {
    return event.channel;
  }
  if ('channel' in event && hasStringProperty(event.channel, 'id')) {
    return event.channel.id;
  }
  if (hasStringProperty(event, 'channel_id')) {
    return event.channel_id;
  }
  if ('item' in event && hasStringProperty(event.item, 'channel')) {
    return event.item.channel;
  }
  if ('assistant_thread' in event && hasStringProperty(event.assistant_thread, 'channel_id')) {
    return event.assistant_thread.channel_id;
  }
  return undefined;
}

/**
 * Type guard that narrows an unknown value to a record (non-null object).
 * @example
 * isRecord({ key: 'value' }) // true
 * isRecord(null)             // false
 * isRecord('string')         // false
 */
export function isRecord<T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>>(
  value: unknown,
): value is T {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard that checks whether an object contains a specific key with a string value.
 * @example
 * hasStringProperty({ channel: 'C123' }, 'channel') // true
 * hasStringProperty({ count: 42 }, 'count')         // false (not a string)
 * hasStringProperty({}, 'channel')                   // false (key missing)
 */
export function hasStringProperty<T, K extends PropertyKey>(obj: T, key: K): obj is T & Record<K, string> {
  return isRecord(obj) && key in obj && typeof obj[key] === 'string';
}
