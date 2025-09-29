import type { Cache } from './cache';
import type { Host } from './host';
import type { Request, Requester, EndRequest, Response } from './requester';

export type Headers = Record<string, string>;
export type QueryParameters = Record<string, any>;

export type RequestOptions = Pick<Request, 'cacheable'> & {
  /**
   * Custom timeout for the request. Note that, in normal situations
   * the given timeout will be applied. But the transporter layer may
   * increase this timeout if there is need for it.
   */
  timeouts?: Partial<Timeouts>;

  /**
   * Custom headers for the request. This headers are
   * going to be merged the transporter headers.
   */
  headers?: Headers;

  /**
   * Custom query parameters for the request. This query parameters are
   * going to be merged the transporter query parameters.
   */
  queryParameters?: QueryParameters;

  /**
   * Custom data for the request. This data is
   * going to be merged the transporter data.
   */
  data?: Array<Record<string, any>> | Record<string, any>;
};

export type StackFrame = {
  request: EndRequest;
  response: Response;
  host: Host;
  triesLeft: number;
};

export type AlgoliaAgentOptions = {
  /**
   * The segment. Usually the integration name.
   */
  segment: string;

  /**
   * The version. Usually the integration version.
   */
  version?: string;
};

export type AlgoliaAgent = {
  /**
   * The raw value of the user agent.
   */
  value: string;

  /**
   * Mutates the current user agent adding the given user agent options.
   */
  add: (options: AlgoliaAgentOptions) => AlgoliaAgent;
};

export type Timeouts = {
  /**
   * Timeout in milliseconds before the connection is established.
   */
  connect: number;

  /**
   * Timeout in milliseconds before reading the response on a read request.
   */
  read: number;

  /**
   * Timeout in milliseconds before reading the response on a write request.
   */
  write: number;
};

export type TransporterOptions = {
  /**
   * The cache of the hosts. Usually used to persist
   * the state of the host when its down.
   */
  hostsCache: Cache;

  /**
   * The underlying requester used. Should differ
   * depending of the environment where the client
   * will be used.
   */
  requester: Requester;

  /**
   * The cache of the requests. When requests are
   * `cacheable`, the returned promised persists
   * in this cache to shared in similar requests
   * before being resolved.
   */
  requestsCache: Cache;

  /**
   * The cache of the responses. When requests are
   * `cacheable`, the returned responses persists
   * in this cache to shared in similar requests.
   */
  responsesCache: Cache;

  /**
   * The timeouts used by the requester. The transporter
   * layer may increase this timeouts as defined on the
   * retry strategy.
   */
  timeouts: Timeouts;

  /**
   * The hosts used by the requester.
   */
  hosts: Host[];

  /**
   * The headers used by the requester. The transporter
   * layer may add some extra headers during the request
   * for the user agent, and others.
   */
  baseHeaders: Headers;

  /**
   * The query parameters used by the requester. The transporter
   * layer may add some extra headers during the request
   * for the user agent, and others.
   */
  baseQueryParameters: QueryParameters;

  /**
   * The user agent used. Sent on query parameters.
   */
  algoliaAgent: AlgoliaAgent;
};

export type Transporter = TransporterOptions & {
  /**
   * Performs a request.
   * The `baseRequest` and `baseRequestOptions` will be merged accordingly.
   */
  request: <TResponse>(baseRequest: Request, baseRequestOptions?: RequestOptions) => Promise<TResponse>;
};
