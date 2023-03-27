import http from 'http';

declare module 'http' {
  interface IncomingMessage {
    // eslint-disable-next-line @typescript-eslint/ban-types
    params?: { [key: string]: string } | string[] | object | undefined;
  }
}

export interface ParamsIncomingMessage extends http.IncomingMessage {
  /**
   * **Only valid for requests with path parameters.**
   *
   * The path parameters of the request. For example, if the request URL is
   * `/users/123`, and the route definition is `/users/:id`
   * then `request.params` will be `{ id: '123' }`.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  params: { [key: string]: string } | string[] | object | undefined;
}
