import type { AxiosInstance, AxiosResponse } from 'axios';
import type { RespondArguments } from '../types';

export function createRespond(
  axiosInstance: AxiosInstance,
  responseUrl: string,
): (response: string | RespondArguments) => Promise<AxiosResponse> {
  return async (message: string | RespondArguments) => {
    const normalizedArgs: RespondArguments = typeof message === 'string' ? { text: message } : message;
    return axiosInstance.post(responseUrl, normalizedArgs);
  };
}
