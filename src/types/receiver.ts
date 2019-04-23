import { RespondFn, AckFn } from '../types';
import { StringIndexed } from './helpers';
import { CodedError, ErrorCode } from '../errors';

export interface ReceiverEvent {
  body: StringIndexed;
  // TODO: there should maybe be some more help for implementors or Receiver to know what kind of argument the AckFn
  // is expected to deal with.
  ack: AckFn<any>;
  respond?: RespondFn;
}

export interface Receiver {
  on(event: 'message', listener: (event: ReceiverEvent) => void): unknown;
  on(event: 'error', listener: (error: Error | ReceiverAckTimeoutError) => void): unknown;
  start(...args: any[]): Promise<unknown>;
  stop(...args: any[]): Promise<unknown>;
}

export interface ReceiverAckTimeoutError extends CodedError {
  code: ErrorCode.ReceiverAckTimeoutError;
}
