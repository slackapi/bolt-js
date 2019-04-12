import { RespondFn, AckFn } from '../types';
import { StringIndexed } from './helpers';

export interface ReceiverEvent {
  body: StringIndexed;
  ack: AckFn<any>;
  respond?: RespondFn;
}

export interface Receiver {
  on(event: 'message', listener: (event: ReceiverEvent) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
  start(...args: any[]): Promise<unknown>;
}
