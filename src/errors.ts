export interface CodedError extends Error {
  code: string; // This can be a value from ErrorCode, or WebClient's ErrorCode, or a NodeJS error code
}

export enum ErrorCode {
  AppInitializationError = 'slack_bolt_app_initialization_error',
  AuthorizationError = 'slack_bolt_authorization_error',

  ContextMissingPropertyError = 'slack_bolt_context_missing_property_error',

  ReceiverAckTimeoutError = 'slack_bolt_receiver_ack_timeout_error',

  ExpressReceiverAuthenticityError = 'slack_bolt_express_receiver_authenticity_error',

  /**
   * This value is used to assign to errors that occur inside the framework but do not have a code, to keep interfaces
   * in terms of CodedError.
   */
  UnknownError = 'slack_bolt_unknown_error',
}

export function errorWithCode(message: string, code: ErrorCode): CodedError {
  const error = new Error(message);
  (error as CodedError).code = code;
  return error as CodedError;
}

export function asCodedError(error: CodedError | Error): CodedError {
  if ((error as CodedError).code !== undefined) {
    return error as CodedError;
  }
  (error as CodedError).code = ErrorCode.UnknownError;
  return error as CodedError;
}
