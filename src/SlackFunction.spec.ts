import 'mocha';
import * as assertNode from 'assert';
import { assert } from 'chai';
import { expectType } from 'tsd';
import rewiremock from 'rewiremock';

import sinon from 'sinon';
import { WebClient } from '@slack/web-api';
import {
  hasCallbackId,
  hasHandler,
  isFunctionExecutedEvent,
  isFunctionInteractivityEvent,
  passConstraint,
} from './SlackFunction';
import withMockValidManifestUtil from './App-slack-function.spec';
import { Override } from './test-helpers';

import {
  AllMiddlewareArgs,
  AnyMiddlewareArgs,
  Middleware,
  SlackEventMiddlewareArgs,
} from './types';

import { FunctionExecutionContext } from './types/functions';
import { SlackFunctionInitializationError } from './errors';
import { ActionConstraints, OptionsConstraints, ViewConstraints } from './App';

export default async function importSlackFunctionModule(overrides: Override = {}): Promise<typeof import('./SlackFunction')> {
  return rewiremock.module(() => import('./SlackFunction'), overrides);
}

describe('SlackFunction module', () => {
  describe('SlackFunction class', () => {
    describe('app.function.action() adds a handler to interactivity handlers', () => {
      it('should not error when valid handler constraints supplied', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const goodConstraints: ActionConstraints = {
          action_id: '',
        };
        const shouldNotThrow = () => testFunc.action(goodConstraints, async () => {});
        assert.doesNotThrow(shouldNotThrow, SlackFunctionInitializationError);
      });
      it('should error when invalid handler constraints supplied', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const badConstraints = {
          bad_id: '',
          action_id: '',
        } as ActionConstraints;
        const shouldThrow = () => testFunc.action(badConstraints, async () => {});
        assert.throws(shouldThrow, SlackFunctionInitializationError);
      });
      it('should return the instance of slackfunction', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const goodConstraints: ActionConstraints = {
          action_id: '',
        };
        const mockHandler = async () => {};
        // expect that the return value of action is a Slack function
        assert.instanceOf(testFunc.action(goodConstraints, mockHandler), SlackFunction);
        // chained valid handlers should not error
        const shouldNotThrow = () => testFunc.action(goodConstraints, mockHandler).action(goodConstraints, mockHandler);
        assert.doesNotThrow(shouldNotThrow, SlackFunctionInitializationError);
      });
    });
    describe('app.function.view() adds a handler to interactivity handlers', () => {
      it('should not error when valid view constraints supplied', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const goodConstraints: ViewConstraints = {
          type: 'view_submission',
        };
        const shouldNotThrow = () => testFunc.view(goodConstraints, async () => {});
        assert.doesNotThrow(shouldNotThrow, SlackFunctionInitializationError);
      });
      it('should error when invalid handler constraints supplied', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const badConstraints = {
          bad_id: 'view_submission',
        } as ViewConstraints;
        const shouldThrow = () => testFunc.view(badConstraints, async () => {});
        assert.throws(shouldThrow, SlackFunctionInitializationError);
      });
      it('should return the instance of SlackFunction', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const goodConstraints: ViewConstraints = {
          callback_id: '',
        };
        const mockHandler = async () => {};
        // expect that the return value of view is a Slack function
        assert.instanceOf(testFunc.view(goodConstraints, mockHandler), SlackFunction);
        // chained valid handlers should not error
        const shouldNotThrow = () => testFunc.view(goodConstraints, mockHandler).view(goodConstraints, mockHandler);
        assert.doesNotThrow(shouldNotThrow, SlackFunctionInitializationError);
      });
    });
    describe('getMiddleware()', () => {
      it('it returns a middleware', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const returnVal = testFunc.getMiddleware();
        assert.isDefined(returnVal);
        expectType<Middleware<AnyMiddlewareArgs>>(returnVal);
      });
    });
    describe('runHandler()', () => {
      it('should call the handler', async () => {
        // set up the slack function
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const spyHandler = sinon.spy((async () => {}) as unknown as Middleware<SlackEventMiddlewareArgs>);
        const testFunc = new SlackFunction(mockFunctionCallbackId, spyHandler);

        // set up event args
        const fakeArgs = {
          next: () => {},
          payload: {
            function_execution_id: '1234',
          },
          body: {},
          client: {} as WebClient,
        } as AnyMiddlewareArgs & AllMiddlewareArgs;

        // ensure handler is called
        await testFunc.runHandler(fakeArgs);
        assert(spyHandler.called);
      });
      it('should gracefully handle errors if promise rejects', async () => {
        // set up the slack function
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const spyHandler = sinon.spy((async () => {
          throw new Error('BOOM!');
        }) as unknown as Middleware<SlackEventMiddlewareArgs>);
        const testFunc = new SlackFunction(mockFunctionCallbackId, spyHandler);

        // set up event args
        const fakeArgs = {
          next: () => {},
          payload: {
            function_execution_id: '1234',
          },
          body: {},
          client: {} as WebClient,
        } as AnyMiddlewareArgs & AllMiddlewareArgs;

        // ensure handler is called
        const shouldNotThrow = async () => testFunc.runHandler(fakeArgs);
        assert.doesNotThrow(shouldNotThrow);
      });
    });
    describe('app.function.blockSuggestion() adds a handler to interactivity handlers', () => {
      it('should not error when valid handler constraints supplied', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const goodConstraints: OptionsConstraints = {
          action_id: '',
        };
        const shouldNotThrow = () => testFunc.blockSuggestion(goodConstraints, async () => {});
        assert.doesNotThrow(shouldNotThrow, SlackFunctionInitializationError);
      });
      it('should error when invalid handler constraints supplied', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const badConstraints = {
          bad_id: '',
          action_id: '',
        } as OptionsConstraints;
        const shouldThrow = () => testFunc.blockSuggestion(badConstraints, async () => {});
        assert.throws(shouldThrow, SlackFunctionInitializationError);
      });
      it('should return the instance of slackfunction', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const goodConstraints: OptionsConstraints = {
          action_id: '',
        };
        const mockHandler = async () => {};
        // expect that the return value of action is a Slack function
        assert.instanceOf(testFunc.blockSuggestion(goodConstraints, mockHandler), SlackFunction);
        // chained valid handlers should not error
        const shouldNotThrow = () => testFunc.blockSuggestion(goodConstraints, mockHandler)
          .blockSuggestion(goodConstraints, mockHandler);
        assert.doesNotThrow(shouldNotThrow, SlackFunctionInitializationError);
      });
    });
    describe('runInteractivityHandlers', () => {
      it('app.function.action() should execute all provided callbacks', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const goodConstraints: ActionConstraints = {
          action_id: 'my-action',
        };
        const mockHandler = async () => Promise.resolve();
        const spy = sinon.spy(mockHandler);
        const spy2 = sinon.spy(mockHandler);
        // add an action handlers
        testFunc.action(goodConstraints, spy).action(goodConstraints, spy2);

        // set up event args
        const fakeArgs = {
          next: () => {},
          payload: {
            action_id: 'my-action',
          },
          body: {
            function_data: {
              execution_id: 'asdasdas',
            },
          },
          client: {} as WebClient,
        } as unknown as AnyMiddlewareArgs & AllMiddlewareArgs;

        // ensure handlers are both called

        await testFunc.runInteractivityHandlers(fakeArgs);
        assert(spy.calledOnce);
        assert(spy2.calledOnce);
      });
      it('app.function.action() should error if a promise rejects', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const action_id = 'my-action';
        const goodConstraints: ActionConstraints = {
          action_id,
        };
        const mockHandler = async () => Promise.reject();
        const spy = sinon.spy(mockHandler);
        // add an action handlers
        testFunc.action(goodConstraints, spy);

        // set up event args
        const fakeArgs = {
          next: () => {},
          payload: {
            action_id,
          },
          body: {
            function_data: {
              execution_id: 'asdasdas',
            },
          },
          client: {} as WebClient,
        } as unknown as AnyMiddlewareArgs & AllMiddlewareArgs;

        // ensure handlers are not
        const shouldReject = async () => testFunc.runInteractivityHandlers(fakeArgs);
        assertNode.rejects(shouldReject);
      });
      it('app.function.blockSuggestion() should execute all provided callbacks', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const goodConstraints: OptionsConstraints = {
          action_id: 'my-action',
        };
        const mockHandler = async () => Promise.resolve();
        const spy = sinon.spy(mockHandler);
        const spy2 = sinon.spy(mockHandler);
        // add an action handlers
        testFunc.blockSuggestion(goodConstraints, spy).blockSuggestion(goodConstraints, spy2);

        // set up event args
        const fakeArgs = {
          next: () => {},
          payload: {
            action_id: 'my-action',
          },
          body: {
            function_data: {
              execution_id: 'asdasdas',
            },
          },
          client: {} as WebClient,
        } as unknown as AnyMiddlewareArgs & AllMiddlewareArgs;

        // ensure handlers are both called

        await testFunc.runInteractivityHandlers(fakeArgs);
        assert(spy.calledOnce);
        assert(spy2.calledOnce);
      });
      it('app.function.blockSuggestion() should error if a promise rejects', async () => {
        const mockFunctionCallbackId = 'reverse_approval';
        const { SlackFunction } = await importSlackFunctionModule(withMockValidManifestUtil(mockFunctionCallbackId));
        const testFunc = new SlackFunction(mockFunctionCallbackId, async () => {});
        const action_id = 'my-action';
        const goodConstraints: OptionsConstraints = {
          action_id,
        };
        const mockHandler = async () => Promise.reject();
        const spy = sinon.spy(mockHandler);
        // add an action handlers
        testFunc.blockSuggestion(goodConstraints, spy);

        // set up event args
        const fakeArgs = {
          next: () => {},
          payload: {
            action_id,
          },
          body: {
            function_data: {
              execution_id: 'asdasdas',
            },
          },
          client: {} as WebClient,
        } as unknown as AnyMiddlewareArgs & AllMiddlewareArgs;

        // ensure handlers are not
        const shouldReject = async () => testFunc.runInteractivityHandlers(fakeArgs);
        assertNode.rejects(shouldReject);
      });
    });
  });
  describe('isFunctionExecutedEvent()', () => {
    it('returns true when args contain function_executed', () => {
      assert.equal(isFunctionExecutedEvent({
        payload: {
          type: 'function_executed',
        },
      } as AnyMiddlewareArgs), true);
    });
    it('returns false when args do not contain function_executed', () => {
      assert.equal(isFunctionExecutedEvent({} as unknown as AnyMiddlewareArgs), false);
      assert.equal(isFunctionExecutedEvent({ payload: { type: '' } } as unknown as AnyMiddlewareArgs), false);
    });
  });
  describe('isFunctionInteractivityEvent()', () => {
    it('returns false if args do not correspond to function interactivity event', () => {
      assert.equal(isFunctionInteractivityEvent({} as AnyMiddlewareArgs & AllMiddlewareArgs), false);
      assert.equal(isFunctionInteractivityEvent({ body: {} } as AnyMiddlewareArgs & AllMiddlewareArgs), false);
      assert.equal(isFunctionInteractivityEvent({ body: { type: '' } } as unknown as AnyMiddlewareArgs & AllMiddlewareArgs), false);
    });
    it('returns true when args correspond to function interactivity event', () => {
      assert.equal(isFunctionInteractivityEvent({
        body: {
          type: 'block_actions',
          function_data: {} as FunctionExecutionContext,
        },
      } as unknown as AnyMiddlewareArgs & AllMiddlewareArgs), true);
    });
  });
  describe('passConstraint()', () => {
    it('should pass when constraintKey does not exist in handler constraints', () => {
      const constraintKey = 'callback_id';
      const constraints = { block_id: 'test_callback_id' };
      const payload = {};
      assert.equal(passConstraint(constraintKey, constraints, payload), true);
    });
    it('should fail when constraintKey in constraints, but not in event payload', () => {
      const constraintKey = 'callback_id';
      const constraints = { callback_id: 'test_callback_id' };
      const payload = {};
      assert.equal(passConstraint(constraintKey, constraints, payload), false);
    });
    it('should pass when value of constraint in handler constraints matches corresponding value in event payload', () => {
      const constraintKey = 'block_id';
      const constraintVal = 'test_callback_id';
      const constraints = { block_id: constraintVal };
      const payload = { block_id: constraintVal };
      assert.equal(passConstraint(constraintKey, constraints, payload), true);
    });
    it('should pass when value of regex constraint matches value in event payload', () => {
      const constraintKey = 'action_id';
      const constraints = { action_id: /approve_*.+/ };
      const payload = { action_id: 'approve_request' };
      assert.equal(passConstraint(constraintKey, constraints, payload), true);
    });
    it('should fail when value of regex constraint does not match against value in event payload', () => {
      const constraintKey = 'action_id';
      const constraints = { action_id: /approve_*.+/ };
      const payload = { action_id: 'not_the_request' };
      assert.equal(passConstraint(constraintKey, constraints, payload), false);
    });
  });
  describe('validate', () => {
    it('should throw a SlackFunctionInitializationError', async () => {
      // set output of one of the tests hasCallbackId to return a no pass
      const { validate } = await importSlackFunctionModule({
        hasCallbackId: () => ({ pass: false, msg: 'Test Message' }),
      });
      const shouldNotBeCalled = sinon.spy();
      const validateFunc = () => validate('', shouldNotBeCalled);
      assert.throws(validateFunc, SlackFunctionInitializationError);
      assert.equal(shouldNotBeCalled.notCalled, true);
    });
  });
  describe('hasCallbackId()', () => {
    it('should pass if callback_id valid', () => {
      const testId = 'approval_request';
      const testRes = hasCallbackId(testId);
      assert.equal(testRes.pass, true);
    });
    it('should fail if callback_id invalid', () => {
      // force cast to trigger failure
      const testId1 = undefined as unknown as string;
      const testRes1 = hasCallbackId(testId1);
      assert.equal(testRes1.pass, false);

      const testId2 = {} as string;
      const testRes2 = hasCallbackId(testId2);
      assert.equal(testRes2.pass, false);

      const testId3 = '';
      const testRes3 = hasCallbackId(testId3);
      assert.equal(testRes3.pass, false);
    });
  });
  describe('hasHandler()', () => {
    it('should pass if handler supplied', () => {
      const mockHandler = async () => {};
      const testRes = hasHandler('', mockHandler);
      assert.equal(testRes.pass, true);
    });
    it('should fail if handler undefined', () => {
      const badHandler = undefined as unknown as Middleware<SlackEventMiddlewareArgs>;
      const testRes1 = hasHandler('', badHandler);
      assert.equal(testRes1.pass, false);
    });
  });
});
describe('SlackFunction utils', () => {
  describe('findMatchingManifestDefinition()', () => {
    it('should error if manifest is missing a functions property', async () => {
      // mock the getManifestData dependency to return
      // a manifest that's missing functions property
      const badManifestOutput = {
        notFunctions: {},
      };
      const getManifestSpy = sinon.spy(() => badManifestOutput);
      const { findMatchingManifestDefinition } = await importSlackFunctionModule({
        './cli/hook-utils/get-manifest-data': {
          getManifestData: getManifestSpy,
        },
      });

      const findFunc = () => findMatchingManifestDefinition('');
      const expectedMsg = '⚠️ Could not find functions in your project manifest.';
      assert.throws(findFunc, SlackFunctionInitializationError, expectedMsg);
      assert(getManifestSpy.called);
    });
    it('should pass if manifest defines function with matching callback_id', async () => {
      const mockManifestOutput = {
        functions: {
          reverse_approval: {},
        },
      };
      const { findMatchingManifestDefinition } = await importSlackFunctionModule({
        './cli/hook-utils/get-manifest-data': {
          getManifestData: () => mockManifestOutput,
        },
      });

      const res = findMatchingManifestDefinition('reverse_approval');
      assert.equal(res.matchFound, true);
      assert.equal(res.fnKeys?.includes('reverse_approval'), true);
    });
    it('should fail if manifest does not define function with matching callback_id', async () => {
      const mockManifestOutput = {
        functions: {
          not_reverse_approval: {},
        },
      };
      const { findMatchingManifestDefinition } = await importSlackFunctionModule({
        './cli/hook-utils/get-manifest-data': {
          getManifestData: () => mockManifestOutput,
        },
      });

      const res = findMatchingManifestDefinition('reverse_approval');
      assert.equal(res.matchFound, false);
      assert.equal(res.fnKeys?.includes('reverse_approval'), false);
    });
  });
});
