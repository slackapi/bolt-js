import { IncomingMessage } from 'http';
import { ParamsDictionary } from 'express-serve-static-core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ParamsIncomingMessage extends IncomingMessage {
  /**
   * **Only valid for requests with path parameters.**
   *
   * The path parameters of the request. For example, if the request URL is
   * `/users/123`, and the route definition is `/users/:id`
   * then `request.params` will be `{ id: '123' }`.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  params?: ParamsDictionary;
}
