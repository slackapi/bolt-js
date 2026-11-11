import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { WebClient } from '@slack/web-api';
import { createFunctionComplete } from '../../../src/context';

describe('createFunctionComplete', () => {
  it('complete should call functions.completeSuccess', async () => {
    const client = new WebClient('sometoken');
    const completeMock = mock.method(client.functions, 'completeSuccess', () => Promise.resolve());
    const complete = createFunctionComplete({ isEnterpriseInstall: false, functionExecutionId: 'Fx1234' }, client);
    await complete();
    assert(completeMock.mock.callCount() > 0, 'client.functions.completeSuccess not called!');
    assert.deepStrictEqual(
      completeMock.mock.calls[0].arguments,
      [{ function_execution_id: 'Fx1234', outputs: {} }],
      'client.functions.completeSuccess called with unexpected arguments!',
    );
  });

  it('should throw if no functionExecutionId present on context', () => {
    const client = new WebClient('sometoken');
    assert.throws(() => {
      createFunctionComplete({ isEnterpriseInstall: false }, client);
    });
  });

  it('should track when the function has been called', async () => {
    const client = new WebClient('sometoken');
    mock.method(client.functions, 'completeSuccess', () => Promise.resolve());
    const complete = createFunctionComplete({ isEnterpriseInstall: false, functionExecutionId: 'Fx1234' }, client);

    assert.strictEqual(complete.hasBeenCalled(), false, 'hasBeenCalled should be false initially');

    await complete();
    assert.ok(complete.hasBeenCalled(), 'hasBeenCalled should be true after invoking complete');
  });
});
