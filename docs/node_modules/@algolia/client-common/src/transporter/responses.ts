import type { Response } from '../types';

export function isNetworkError({ isTimedOut, status }: Omit<Response, 'content'>): boolean {
  return !isTimedOut && ~~status === 0;
}

export function isRetryable({ isTimedOut, status }: Omit<Response, 'content'>): boolean {
  return isTimedOut || isNetworkError({ isTimedOut, status }) || (~~(status / 100) !== 2 && ~~(status / 100) !== 4);
}

export function isSuccess({ status }: Pick<Response, 'status'>): boolean {
  return ~~(status / 100) === 2;
}
