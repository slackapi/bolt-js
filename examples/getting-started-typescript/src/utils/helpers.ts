import { GenericMessageEvent } from '@slack/bolt';

export const isGenericMessageEvent = (msg: any): msg is GenericMessageEvent => {
  return (msg as GenericMessageEvent).subtype === undefined;
}
