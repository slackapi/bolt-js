import {
  GenericMessageEvent,
  MessageEvent,
  ReactionAddedEvent,
  ReactionMessageItem,
} from '@slack/bolt';

export const isGenericMessageEvent = (msg: MessageEvent):
  msg is GenericMessageEvent => (msg as GenericMessageEvent).subtype === undefined;

export const isMessageItem = (item: ReactionAddedEvent['item']):
  item is ReactionMessageItem => (item as ReactionMessageItem).type === 'message';
