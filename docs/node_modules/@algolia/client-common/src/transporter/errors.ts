import type { Response, StackFrame } from '../types';

export class AlgoliaError extends Error {
  name: string = 'AlgoliaError';

  constructor(message: string, name: string) {
    super(message);

    if (name) {
      this.name = name;
    }
  }
}

export class ErrorWithStackTrace extends AlgoliaError {
  stackTrace: StackFrame[];

  constructor(message: string, stackTrace: StackFrame[], name: string) {
    super(message, name);
    // the array and object should be frozen to reflect the stackTrace at the time of the error
    this.stackTrace = stackTrace;
  }
}

export class RetryError extends ErrorWithStackTrace {
  constructor(stackTrace: StackFrame[]) {
    super(
      'Unreachable hosts - your application id may be incorrect. If the error persists, please reach out to the Algolia Support team: https://alg.li/support.',
      stackTrace,
      'RetryError',
    );
  }
}

export class ApiError extends ErrorWithStackTrace {
  status: number;

  constructor(message: string, status: number, stackTrace: StackFrame[], name = 'ApiError') {
    super(message, stackTrace, name);
    this.status = status;
  }
}

export class DeserializationError extends AlgoliaError {
  response: Response;

  constructor(message: string, response: Response) {
    super(message, 'DeserializationError');
    this.response = response;
  }
}

export type DetailedErrorWithMessage = {
  message: string;
  label: string;
};

export type DetailedErrorWithTypeID = {
  id: string;
  type: string;
  name?: string;
};

export type DetailedError = {
  code: string;
  details?: DetailedErrorWithMessage[] | DetailedErrorWithTypeID[];
};

// DetailedApiError is only used by the ingestion client to return more informative error, other clients will use ApiClient.
export class DetailedApiError extends ApiError {
  error: DetailedError;

  constructor(message: string, status: number, error: DetailedError, stackTrace: StackFrame[]) {
    super(message, status, stackTrace, 'DetailedApiError');
    this.error = error;
  }
}
