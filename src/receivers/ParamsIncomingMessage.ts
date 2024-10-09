import type { IncomingMessage } from 'node:http';
import type { ParamsDictionary } from 'express-serve-static-core';

export interface ParamsIncomingMessage extends IncomingMessage {
  /**
   * **Only valid for requests with path parameters.**
   *
   * The path parameters of the request. For example, if the request URL is
   * `/users/123`, and the route definition is `/users/:id`
   * then `request.params` will be `{ id: '123' }`.
   */
  params?: ParamsDictionary;
}
