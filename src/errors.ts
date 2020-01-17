export interface CodedError extends Error {
  code: string; // This can be a value from ErrorCode, or WebClient's ErrorCode, or a NodeJS error code
}

export enum ErrorCode {
  AppInitializationError = 'slack_bolt_app_initialization_error',
  AuthorizationError = 'slack_bolt_authorization_error',

  ContextMissingPropertyError = 'slack_bolt_context_missing_property_error',

  ReceiverAckTimeoutError = 'slack_bolt_receiver_ack_timeout_error',

  ReceiverAuthenticityError = 'slack_bolt_receiver_authenticity_error',

  /**
   * This value is used to assign to errors that occur inside the framework but do not have a code, to keep interfaces
   * in terms of CodedError.
   */
  UnknownError = 'slack_bolt_unknown_error',
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

export class ReceiverAckTimeoutError extends Error implements CodedError {
  public code = ErrorCode.ReceiverAckTimeoutError;
}

export class ReceiverAuthenticityError extends Error implements CodedError {
  public code = ErrorCode.ReceiverAuthenticityError;
}

export class UnknownError extends Error implements CodedError {
  public code = ErrorCode.UnknownError;
  public original: Error;

  constructor(original: Error) {
    super(original.message);

    this.original = original;
  }
}
