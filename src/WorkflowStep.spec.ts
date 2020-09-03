import 'mocha';
import { assert } from 'chai';
import sinon from 'sinon';
import rewiremock from 'rewiremock';
import {
  WorkflowStep,
  SlackWorkflowStepMiddlewareArgs,
  AllWorkflowStepMiddlewareArgs,
  WorkflowStepMiddleware,
  WorkflowStepOptions,
} from './WorkflowStep';
import { Override } from './test-helpers';
import { AllMiddlewareArgs, AnyMiddlewareArgs, WorkflowStepEdit, Middleware } from './types';
import { WorkflowStepInitializationError } from './errors';

async function importWorkflowStep(overrides: Override = {}): Promise<typeof import('./WorkflowStep')> {
  return rewiremock.module(() => import('./WorkflowStep'), overrides);
}

const MOCK_FN = async () => {
  return;
};

const MOCK_CONFIG_SINGLE = {
  edit: MOCK_FN,
  save: MOCK_FN,
  execute: MOCK_FN,
};

const MOCK_CONFIG_MULTIPLE = {
  edit: [MOCK_FN, MOCK_FN],
  save: [MOCK_FN],
  execute: [MOCK_FN, MOCK_FN, MOCK_FN],
};

describe('WorkflowStep', () => {
  describe('constructor', () => {
    it('should accept config as single functions', async () => {
      const ws = new WorkflowStep('test_callback_id', MOCK_CONFIG_SINGLE);
      assert.isNotNull(ws);
    });

    it('should accept config as multiple functions', async () => {
      const ws = new WorkflowStep('test_callback_id', MOCK_CONFIG_MULTIPLE);
      assert.isNotNull(ws);
    });
  });

  describe('validate', () => {
    it('should throw an error if callback_id is not valid', async () => {
      const { validate } = await importWorkflowStep();

      // intentionally casting to string to trigger failure
      const badId = {} as string;
      const validationFn = () => validate(badId, MOCK_CONFIG_SINGLE);

      const expectedMsg = 'WorkflowStep expects a callback_id as the first argument';
      assert.throws(validationFn, WorkflowStepInitializationError, expectedMsg);
    });

    it('should throw an error if required keys are missing', async () => {
      const { validate } = await importWorkflowStep();

      // intentionally casting to WorkflowStepOptions to trigger failure
      const badConfig = ({
        edit: async () => {},
      } as unknown) as WorkflowStepOptions;

      const validationFn = () => validate('callback_id', badConfig);
      const expectedMsg = 'WorkflowStep is missing required keys: save, execute';
      assert.throws(validationFn, WorkflowStepInitializationError, expectedMsg);
    });

    it('should throw an error if lifecycle props are not a single callback or an array of callbacks', async () => {
      const { validate } = await importWorkflowStep();

      // intentionally casting to WorkflowStepOptions to trigger failure
      const badConfig = ({
        edit: async () => {},
        save: {},
        execute: async () => {},
      } as unknown) as WorkflowStepOptions;

      const validationFn = () => validate('callback_id', badConfig);
      const expectedMsg = 'WorkflowStep save property must be a function or an array of functions';
      assert.throws(validationFn, WorkflowStepInitializationError, expectedMsg);
    });
  });

  describe('isStepEvent', () => {
    it('should return true if recognized workflow step payload type', async () => {
      const fakeEditArgs = (createFakeStepEditAction() as unknown) as SlackWorkflowStepMiddlewareArgs &
        AllMiddlewareArgs;
      const fakeViewArgs = (createFakeStepViewEvent() as unknown) as SlackWorkflowStepMiddlewareArgs &
        AllMiddlewareArgs;
      const fakeExecuteArgs = (createFakeStepExecuteEvent() as unknown) as SlackWorkflowStepMiddlewareArgs &
        AllMiddlewareArgs;

      const { isStepEvent } = await importWorkflowStep();

      const editIsStepEvent = isStepEvent(fakeEditArgs);
      const viewIsStepEvent = isStepEvent(fakeViewArgs);
      const executeIsStepEvent = isStepEvent(fakeExecuteArgs);

      assert.isTrue(editIsStepEvent);
      assert.isTrue(viewIsStepEvent);
      assert.isTrue(executeIsStepEvent);
    });

    it('should return false if not a recognized workflow step payload type', async () => {
      const fakeEditArgs = (createFakeStepEditAction() as unknown) as AnyMiddlewareArgs;
      fakeEditArgs.payload.type = 'invalid_type';

      const { isStepEvent } = await importWorkflowStep();
      const actionIsStepEvent = isStepEvent(fakeEditArgs);

      assert.isFalse(actionIsStepEvent);
    });
  });

  describe('prepareStepArgs', () => {
    it('should remove next() from all original event args', async () => {
      const fakeEditArgs = (createFakeStepEditAction() as unknown) as SlackWorkflowStepMiddlewareArgs &
        AllMiddlewareArgs;
      const fakeViewArgs = (createFakeStepViewEvent() as unknown) as SlackWorkflowStepMiddlewareArgs &
        AllMiddlewareArgs;
      const fakeExecuteArgs = (createFakeStepExecuteEvent() as unknown) as SlackWorkflowStepMiddlewareArgs &
        AllMiddlewareArgs;

      const { prepareStepArgs } = await importWorkflowStep();

      const editStepArgs = prepareStepArgs(fakeEditArgs);
      const viewStepArgs = prepareStepArgs(fakeViewArgs);
      const executeStepArgs = prepareStepArgs(fakeExecuteArgs);

      assert.notExists(editStepArgs.next);
      assert.notExists(viewStepArgs.next);
      assert.notExists(executeStepArgs.next);
    });

    it('should augment workflow_step_edit args with step and configure()', async () => {
      const fakeArgs = (createFakeStepEditAction() as unknown) as SlackWorkflowStepMiddlewareArgs & AllMiddlewareArgs;
      const { prepareStepArgs } = await importWorkflowStep();
      const stepArgs = prepareStepArgs(fakeArgs);

      assert.exists(stepArgs.step);
      assert.exists(stepArgs.configure);
    });

    it('should augment view_submission with step and update()', async () => {
      const fakeArgs = (createFakeStepViewEvent() as unknown) as SlackWorkflowStepMiddlewareArgs & AllMiddlewareArgs;
      const { prepareStepArgs } = await importWorkflowStep();
      const stepArgs = prepareStepArgs(fakeArgs);

      assert.exists(stepArgs.step);
      assert.exists(stepArgs.update);
    });

    it('should augment workflow_step_execute with step, complete() and fail()', async () => {
      const fakeArgs = (createFakeStepExecuteEvent() as unknown) as SlackWorkflowStepMiddlewareArgs & AllMiddlewareArgs;
      const { prepareStepArgs } = await importWorkflowStep();
      const stepArgs = prepareStepArgs(fakeArgs);

      assert.exists(stepArgs.step);
      assert.exists(stepArgs.complete);
      assert.exists(stepArgs.fail);
    });
  });

  describe('processStepMiddleware', () => {
    it('should call each callback in user-provided middleware', async () => {
      const { next, ...fakeArgs } = (createFakeStepEditAction() as unknown) as AllWorkflowStepMiddlewareArgs;
      const { processStepMiddleware } = await importWorkflowStep();

      const fn1 = sinon.spy((async ({ next }) => {
        await next!();
      }) as Middleware<WorkflowStepEdit>);
      const fn2 = sinon.spy(async () => {});
      const fakeMiddleware = [fn1, fn2] as WorkflowStepMiddleware;

      await processStepMiddleware(fakeArgs, fakeMiddleware);

      assert(fn1.called);
      assert(fn2.called);
    });
  });
});

function createFakeStepEditAction() {
  return {
    body: {
      callback_id: 'foo',
      trigger_id: 'bar',
    },
    payload: {
      type: 'workflow_step_edit',
    },
    action: {
      workflow_step: {},
    },
    context: {},
    next: sinon.fake(),
  };
}

function createFakeStepViewEvent() {
  return {
    body: {
      callback_id: 'foo',
      trigger_id: 'bar',
      workflow_step: {
        workflow_step_edit_id: '',
      },
    },
    payload: {
      type: 'workflow_step',
    },
    context: {},
    next: sinon.fake(),
  };
}

function createFakeStepExecuteEvent() {
  return {
    body: {
      callback_id: 'foo',
      trigger_id: 'bar',
    },
    event: {
      workflow_step: {},
    },
    payload: {
      type: 'workflow_step_execute',
      workflow_step: {
        workflow_step_execute_id: '',
      },
    },
    context: {},
    next: sinon.fake(),
  };
}
