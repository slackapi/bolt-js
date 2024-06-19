import 'mocha';
import { assert } from 'chai';

import { WebClient } from '@slack/web-api';

import CustomFunction from './CustomFunction';
import { CustomFunctionInitializationError, CustomFunctionRuntimeError } from './errors';
import { Context, CustomFunctionMiddleware } from './types';

/**
 * Common implementation checks for App#function are found in App-custom-function.spec.ts
 * while some of the edge and error cases are covered here.
 */

describe('CustomFunction class', () => {
  const MOCK_FN = async () => { };
  let mockClient: WebClient;

  beforeEach(() => {
    mockClient = new WebClient();
  });

  describe('constructor', () => {
    it('should throw an error if callback_id is not valid', async () => {
      const badId = {} as string;
      const fn = () => new CustomFunction(badId, [MOCK_FN], mockClient);
      const expectedMsg = 'CustomFunction expects a callback_id as the first argument';
      assert.throws(fn, CustomFunctionInitializationError, expectedMsg);
    });

    it('should throw an error if middleware is not a function or array', async () => {
      const badConfig = '' as unknown as CustomFunctionMiddleware;
      const fn = () => new CustomFunction('callback_id', badConfig, mockClient);
      const expectedMsg = 'CustomFunction expects a function or array of functions as the second argument';
      assert.throws(fn, CustomFunctionInitializationError, expectedMsg);
    });

    it('should throw an error if middleware is not a single callback or an array of callbacks', async () => {
      const badMiddleware = [async () => { }, 'not-a-function'] as unknown as CustomFunctionMiddleware;
      const fn = () => new CustomFunction('callback_id', badMiddleware, mockClient);
      const expectedMsg = 'CustomFunction middleware argument 1 is not a function but should be a function';
      assert.throws(fn, CustomFunctionInitializationError, expectedMsg);
    });
  });

  describe('middlewareArgs', () => {
    it('should throw an error if no function execution id exists in the context', async () => {
      const mockContext: Context = { isEnterpriseInstall: true };
      const fn = () => CustomFunction.middlewareArgs(mockContext, mockClient);
      const expectedMsg = 'No function_execution_id was found in the context';
      assert.throws(fn, CustomFunctionRuntimeError, expectedMsg);
    });
  });
});
