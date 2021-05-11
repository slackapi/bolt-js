import 'mocha';
import { assert } from 'chai';
import sinon from 'sinon';
import rewiremock from 'rewiremock';
import {
  WorkflowStep,
  SlackWorkflowStepMiddlewareArgs,
  AllWorkflowStepMiddlewareArgs,
  WorkflowStepMiddleware,
  WorkflowStepConfig,
  WorkflowStepEditMiddlewareArgs,
  WorkflowStepSaveMiddlewareArgs,
  WorkflowStepExecuteMiddlewareArgs,
} from './WorkflowStep';
import { Override } from './test-helpers';
import { AllMiddlewareArgs, AnyMiddlewareArgs, WorkflowStepEdit, Middleware } from './types';
import { WorkflowStepInitializationError } from './errors';
import { WebClient } from '@slack/web-api';

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

  describe('getMiddleware', () => {
    it('should not call next if a workflow step event', async () => {
      const ws = new WorkflowStep('test_edit_callback_id', MOCK_CONFIG_SINGLE);
      const middleware = ws.getMiddleware();
      const fakeEditArgs = createFakeStepEditAction() as unknown as SlackWorkflowStepMiddlewareArgs & AllMiddlewareArgs;

      const fakeNext = sinon.spy();
      fakeEditArgs.next = fakeNext;

      await middleware(fakeEditArgs);

      assert(fakeNext.notCalled);
    });

    it('should call next if valid workflow step with mismatched callback_id', async () => {
      const ws = new WorkflowStep('bad_callback_id', MOCK_CONFIG_SINGLE);
      const middleware = ws.getMiddleware();
      const fakeEditArgs = createFakeStepEditAction() as unknown as SlackWorkflowStepMiddlewareArgs & AllMiddlewareArgs;

      const fakeNext = sinon.spy();
      fakeEditArgs.next = fakeNext;

      await middleware(fakeEditArgs);

      assert(fakeNext.called);
    });

    it('should call next if not a workflow step event', async () => {
      const ws = new WorkflowStep('test_view_callback_id', MOCK_CONFIG_SINGLE);
      const middleware = ws.getMiddleware();
      const fakeViewArgs = createFakeViewEvent() as unknown as SlackWorkflowStepMiddlewareArgs & AllMiddlewareArgs;

      const fakeNext = sinon.spy();
      fakeViewArgs.next = fakeNext;

      await middleware(fakeViewArgs);

      assert(fakeNext.called);
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

    it('should throw an error if config is not an object', async () => {
      const { validate } = await importWorkflowStep();

      // intentionally casting to WorkflowStepConfig to trigger failure
      const badConfig = '' as unknown as WorkflowStepConfig;

      const validationFn = () => validate('callback_id', badConfig);
      const expectedMsg = 'WorkflowStep expects a configuration object as the second argument';
      assert.throws(validationFn, WorkflowStepInitializationError, expectedMsg);
    });

    it('should throw an error if required keys are missing', async () => {
      const { validate } = await importWorkflowStep();

      // intentionally casting to WorkflowStepConfig to trigger failure
      const badConfig = {
        edit: async () => {},
      } as unknown as WorkflowStepConfig;

      const validationFn = () => validate('callback_id', badConfig);
      const expectedMsg = 'WorkflowStep is missing required keys: save, execute';
      assert.throws(validationFn, WorkflowStepInitializationError, expectedMsg);
    });

    it('should throw an error if lifecycle props are not a single callback or an array of callbacks', async () => {
      const { validate } = await importWorkflowStep();

      // intentionally casting to WorkflowStepConfig to trigger failure
      const badConfig = {
        edit: async () => {},
        save: {},
        execute: async () => {},
      } as unknown as WorkflowStepConfig;

      const validationFn = () => validate('callback_id', badConfig);
      const expectedMsg = 'WorkflowStep save property must be a function or an array of functions';
      assert.throws(validationFn, WorkflowStepInitializationError, expectedMsg);
    });
  });

  describe('isStepEvent', () => {
    it('should return true if recognized workflow step payload type', async () => {
      const fakeEditArgs = createFakeStepEditAction() as unknown as SlackWorkflowStepMiddlewareArgs & AllMiddlewareArgs;
      const fakeSaveArgs = createFakeStepSaveEvent() as unknown as SlackWorkflowStepMiddlewareArgs & AllMiddlewareArgs;
      const fakeExecuteArgs = createFakeStepExecuteEvent() as unknown as SlackWorkflowStepMiddlewareArgs &
        AllMiddlewareArgs;

      const { isStepEvent } = await importWorkflowStep();

      const editIsStepEvent = isStepEvent(fakeEditArgs);
      const viewIsStepEvent = isStepEvent(fakeSaveArgs);
      const executeIsStepEvent = isStepEvent(fakeExecuteArgs);

      assert.isTrue(editIsStepEvent);
      assert.isTrue(viewIsStepEvent);
      assert.isTrue(executeIsStepEvent);
    });

    it('should return false if not a recognized workflow step payload type', async () => {
      const fakeEditArgs = createFakeStepEditAction() as unknown as AnyMiddlewareArgs;
      fakeEditArgs.payload.type = 'invalid_type';

      const { isStepEvent } = await importWorkflowStep();
      const actionIsStepEvent = isStepEvent(fakeEditArgs);

      assert.isFalse(actionIsStepEvent);
    });
  });

  describe('prepareStepArgs', () => {
    it('should remove next() from all original event args', async () => {
      const fakeEditArgs = createFakeStepEditAction() as unknown as SlackWorkflowStepMiddlewareArgs & AllMiddlewareArgs;
      const fakeSaveArgs = createFakeStepSaveEvent() as unknown as SlackWorkflowStepMiddlewareArgs & AllMiddlewareArgs;
      const fakeExecuteArgs = createFakeStepExecuteEvent() as unknown as SlackWorkflowStepMiddlewareArgs &
        AllMiddlewareArgs;

      const { prepareStepArgs } = await importWorkflowStep();

      const editStepArgs = prepareStepArgs(fakeEditArgs);
      const viewStepArgs = prepareStepArgs(fakeSaveArgs);
      const executeStepArgs = prepareStepArgs(fakeExecuteArgs);

      assert.notExists(editStepArgs.next);
      assert.notExists(viewStepArgs.next);
      assert.notExists(executeStepArgs.next);
    });

    it('should augment workflow_step_edit args with step and configure()', async () => {
      const fakeArgs = createFakeStepEditAction();
      const { prepareStepArgs } = await importWorkflowStep();
      // casting to returned type because prepareStepArgs isn't built to do so
      const stepArgs = prepareStepArgs(fakeArgs) as AllWorkflowStepMiddlewareArgs<WorkflowStepEditMiddlewareArgs>;

      assert.exists(stepArgs.step);
      assert.exists(stepArgs.configure);
    });

    it('should augment view_submission with step and update()', async () => {
      const fakeArgs = createFakeStepSaveEvent();
      const { prepareStepArgs } = await importWorkflowStep();
      // casting to returned type because prepareStepArgs isn't built to do so
      const stepArgs = prepareStepArgs(fakeArgs) as AllWorkflowStepMiddlewareArgs<WorkflowStepSaveMiddlewareArgs>;

      assert.exists(stepArgs.step);
      assert.exists(stepArgs.update);
    });

    it('should augment workflow_step_execute with step, complete() and fail()', async () => {
      const fakeArgs = createFakeStepExecuteEvent();
      const { prepareStepArgs } = await importWorkflowStep();
      // casting to returned type because prepareStepArgs isn't built to do so
      const stepArgs = prepareStepArgs(fakeArgs) as AllWorkflowStepMiddlewareArgs<WorkflowStepExecuteMiddlewareArgs>;

      assert.exists(stepArgs.step);
      assert.exists(stepArgs.complete);
      assert.exists(stepArgs.fail);
    });
  });

  describe('step utility functions', () => {
    it('configure should call views.open', async () => {
      const fakeEditArgs = createFakeStepEditAction() as unknown as AllWorkflowStepMiddlewareArgs;

      const fakeClient = { views: { open: sinon.spy() } };
      fakeEditArgs.client = fakeClient as unknown as WebClient;

      const { prepareStepArgs } = await importWorkflowStep();
      // casting to returned type because prepareStepArgs isn't built to do so
      const editStepArgs = prepareStepArgs(
        fakeEditArgs,
      ) as AllWorkflowStepMiddlewareArgs<WorkflowStepEditMiddlewareArgs>;

      await editStepArgs.configure({ blocks: [] });

      assert(fakeClient.views.open.called);
    });

    it('update should call workflows.updateStep', async () => {
      const fakeSaveArgs = createFakeStepSaveEvent() as unknown as AllWorkflowStepMiddlewareArgs;

      const fakeClient = { workflows: { updateStep: sinon.spy() } };
      fakeSaveArgs.client = fakeClient as unknown as WebClient;

      const { prepareStepArgs } = await importWorkflowStep();
      // casting to returned type because prepareStepArgs isn't built to do so
      const saveStepArgs = prepareStepArgs(
        fakeSaveArgs,
      ) as AllWorkflowStepMiddlewareArgs<WorkflowStepSaveMiddlewareArgs>;

      await saveStepArgs.update();

      assert(fakeClient.workflows.updateStep.called);
    });

    it('complete should call workflows.stepCompleted', async () => {
      const fakeExecuteArgs = createFakeStepExecuteEvent() as unknown as SlackWorkflowStepMiddlewareArgs &
        AllMiddlewareArgs;

      const fakeClient = { workflows: { stepCompleted: sinon.spy() } };
      fakeExecuteArgs.client = fakeClient as unknown as WebClient;

      const { prepareStepArgs } = await importWorkflowStep();
      // casting to returned type because prepareStepArgs isn't built to do so
      const executeStepArgs = prepareStepArgs(
        fakeExecuteArgs,
      ) as AllWorkflowStepMiddlewareArgs<WorkflowStepExecuteMiddlewareArgs>;

      await executeStepArgs.complete();

      assert(fakeClient.workflows.stepCompleted.called);
    });

    it('fail should call workflows.stepFailed', async () => {
      const fakeExecuteArgs = createFakeStepExecuteEvent() as unknown as SlackWorkflowStepMiddlewareArgs &
        AllMiddlewareArgs;

      const fakeClient = { workflows: { stepFailed: sinon.spy() } };
      fakeExecuteArgs.client = fakeClient as unknown as WebClient;

      const { prepareStepArgs } = await importWorkflowStep();
      // casting to returned type because prepareStepArgs isn't built to do so
      const executeStepArgs = prepareStepArgs(
        fakeExecuteArgs,
      ) as AllWorkflowStepMiddlewareArgs<WorkflowStepExecuteMiddlewareArgs>;

      await executeStepArgs.fail({ error: { message: 'Failed' } });

      assert(fakeClient.workflows.stepFailed.called);
    });
  });

  describe('processStepMiddleware', () => {
    it('should call each callback in user-provided middleware', async () => {
      const { next, ...fakeArgs } = createFakeStepEditAction() as unknown as AllWorkflowStepMiddlewareArgs;
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
      callback_id: 'test_edit_callback_id',
      trigger_id: 'test_edit_trigger_id',
    },
    payload: {
      type: 'workflow_step_edit',
      callback_id: 'test_edit_callback_id',
    },
    action: {
      workflow_step: {},
    },
    context: {},
    next: sinon.fake(),
  };
}

function createFakeStepSaveEvent() {
  return {
    body: {
      callback_id: 'test_save_callback_id',
      trigger_id: 'test_save_trigger_id',
      workflow_step: {
        workflow_step_edit_id: '',
      },
    },
    payload: {
      type: 'workflow_step',
      callback_id: 'test_save_callback_id',
    },
    context: {},
    next: sinon.fake(),
  };
}

function createFakeStepExecuteEvent() {
  return {
    body: {
      callback_id: 'test_execute_callback_id',
      trigger_id: 'test_execute_trigger_id',
    },
    event: {
      workflow_step: {},
    },
    payload: {
      type: 'workflow_step_execute',
      callback_id: 'test_execute_callback_id',
      workflow_step: {
        workflow_step_execute_id: '',
      },
    },
    context: {},
    next: sinon.fake(),
  };
}

function createFakeViewEvent() {
  return {
    body: {
      callback_id: 'test_view_callback_id',
      trigger_id: 'test_view_trigger_id',
      workflow_step: {
        workflow_step_edit_id: '',
      },
    },
    payload: {
      type: 'view_submission',
      callback_id: 'test_view_callback_id',
    },
    context: {},
    next: sinon.fake(),
  };
}
