/* eslint-disable @typescript-eslint/no-explicit-any */
import App from '../App';
import { AckFn } from './index';
import { StringIndexed } from './helpers';

export interface ReceiverEvent {
  // Parsed HTTP request body / Socket Mode message body
  body: StringIndexed;

  // X-Slack-Retry-Num: 2 in HTTP Mode
  // "retry_attempt": 0, in Socket Mode
  retryNum?: number;

  // X-Slack-Retry-Reason: http_error in HTTP Mode
  // "retry_reason": "timeout", in Socket Mode
  retryReason?: string;

  // Custom properties like HTTP request headers
  customProperties?: StringIndexed;

  // The function to acknowledge incoming requests
  // The details of implementation is encapsulated in a receiver
  // TODO: Make the argument type more specific
  ack: AckFn<any>;
}

export interface Receiver {
  init(app: App): void;
  start(...args: any[]): Promise<unknown>;
  stop(...args: any[]): Promise<unknown>;
}
