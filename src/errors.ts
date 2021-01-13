import type { IncomingMessage, ServerResponse } from 'http';
import type { BufferedIncomingMessage } from './receivers/verify-request';

/* eslint-disable @typescript-eslint/explicit-member-accessibility */
export interface CodedError extends Error {
  code: string; // This can be a value from ErrorCode, or WebClient's ErrorCode, or a NodeJS error code
}

export enum ErrorCode {
  AppInitializationError = 'slack_bolt_app_initialization_error',
  AuthorizationError = 'slack_bolt_authorization_error',

  ContextMissingPropertyError = 'slack_bolt_context_missing_property_error',

  ReceiverMultipleAckError = 'slack_bolt_receiver_ack_multiple_error',
  ReceiverAuthenticityError = 'slack_bolt_receiver_authenticity_error',
  ReceiverInconsistentStateError = 'slack_bolt_receiver_inconsistent_state_error',

  MultipleListenerError = 'slack_bolt_multiple_listener_error',

  HTTPReceiverDeferredRequestError = 'slack_bolt_http_receiver_deferred_request_error',

  /**
   * This value is used to assign to errors that occur inside the framework but do not have a code, to keep interfaces
   * in terms of CodedError.
   */
  UnknownError = 'slack_bolt_unknown_error',

  WorkflowStepInitializationError = 'slack_bolt_workflow_step_initialization_error',
}

export function asCodedError(error: CodedError | Error): CodedError {
  if ((error as CodedError).code !== undefined) {
    return error as CodedError;
  }

  return new UnknownError(error);
}

export class AppInitializationError extends Error implements CodedError {
  public code = ErrorCode.AppInitializationError;
}

export class AuthorizationError extends Error implements CodedError {
  public code = ErrorCode.AuthorizationError;

  public original: Error;

  constructor(message: string, original: Error) {
    super(message);

    this.original = original;
  }
}

export class ContextMissingPropertyError extends Error implements CodedError {
  public code = ErrorCode.ContextMissingPropertyError;

  public missingProperty: string;

  constructor(missingProperty: string, message: string) {
    super(message);
    this.missingProperty = missingProperty;
  }
}

export class ReceiverMultipleAckError extends Error implements CodedError {
  public code = ErrorCode.ReceiverMultipleAckError;

  constructor() {
    super("The receiver's `ack` function was called multiple times.");
  }
}

export class ReceiverAuthenticityError extends Error implements CodedError {
  public code = ErrorCode.ReceiverAuthenticityError;
}

export class ReceiverInconsistentStateError extends Error implements CodedError {
  public code = ErrorCode.ReceiverInconsistentStateError;
}

export class HTTPReceiverDeferredRequestError extends Error implements CodedError {
  public code = ErrorCode.HTTPReceiverDeferredRequestError;

  public req: IncomingMessage | BufferedIncomingMessage;

  public res: ServerResponse;

  constructor(message: string, req: IncomingMessage | BufferedIncomingMessage, res: ServerResponse) {
    super(message);
    this.req = req;
    this.res = res;
  }
}

export class MultipleListenerError extends Error implements CodedError {
  public code = ErrorCode.MultipleListenerError;

  public originals: Error[];

  constructor(originals: Error[]) {
    super(
      'Multiple errors occurred while handling several listeners. The `originals` property contains an array of each error.',
    );

    this.originals = originals;
  }
}

export class UnknownError extends Error implements CodedError {
  public code = ErrorCode.UnknownError;

  public original: Error;

  constructor(original: Error) {
    super(original.message);

    this.original = original;
  }
}

export class WorkflowStepInitializationError extends Error implements CodedError {
  public code = ErrorCode.WorkflowStepInitializationError;
}
