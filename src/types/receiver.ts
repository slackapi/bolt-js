import App from '../App';
import { AckFn } from './index';
import { StringIndexed } from './helpers';

export interface ReceiverEvent {
  body: StringIndexed;
  // TODO: there should maybe be some more help for implementors of Receiver to know what kind of argument the AckFn
  // is expected to deal with.
  ack: AckFn<any>;
}

export interface Receiver {
  init(app: App): void;
  start(...args: any[]): Promise<unknown>;
  stop(...args: any[]): Promise<unknown>;
}
