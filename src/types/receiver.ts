import { RespondFn, AckFn } from '../types';
import { StringIndexed } from './helpers';

export interface ReceiverEvent {
  body: StringIndexed;
  // TODO: there should maybe be some more help for implementors or Receiver to know what kind of argument the AckFn
  // is expected to deal with.
  ack: AckFn<any>;
  respond?: RespondFn;
}

export interface Receiver {
  on(event: 'message', listener: (event: ReceiverEvent) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
  start(...args: any[]): Promise<unknown>;
  stop(...args: any[]): Promise<unknown>;
}
