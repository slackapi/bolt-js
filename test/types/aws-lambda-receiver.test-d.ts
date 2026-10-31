import { expectAssignable } from 'tsd';
import type { AwsEventV1 } from '../../src/receivers/AwsLambdaReceiver';

// multiValueQueryStringParameters can be null (as AWS sends when no multi-value params exist)
expectAssignable<AwsEventV1>({
  body: null,
  headers: {},
  isBase64Encoded: false,
  pathParameters: null,
  queryStringParameters: null,
  requestContext: {},
  stageVariables: null,
  httpMethod: 'POST',
  multiValueHeaders: {},
  multiValueQueryStringParameters: null,
  path: '/slack/events',
  resource: '/slack/events',
});
