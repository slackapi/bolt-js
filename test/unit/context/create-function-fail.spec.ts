import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { WebClient } from '@slack/web-api';
import { createFunctionFail } from '../../../src/context';

describe('createFunctionFail', () => {
  it('fail should call functions.completeError', async () => {
    const client = new WebClient('sometoken');
    const completeMock = mock.method(client.functions, 'completeError', () => Promise.resolve());
    const fail = createFunctionFail({ isEnterpriseInstall: false, functionExecutionId: 'Fx1234' }, client);
    await fail({ error: 'boom' });
    assert(completeMock.mock.callCount() > 0, 'client.functions.completeError not called!');
    assert.deepStrictEqual(
      completeMock.mock.calls[0].arguments,
      [{ function_execution_id: 'Fx1234', error: 'boom' }],
      'client.functions.completeError called with unexpected arguments!',
    );
  });

  it('should throw if no functionExecutionId present on context', () => {
    const client = new WebClient('sometoken');
    assert.throws(() => {
      createFunctionFail({ isEnterpriseInstall: false }, client);
    });
  });

  it('should track when the function has been called', async () => {
    const client = new WebClient('sometoken');
    mock.method(client.functions, 'completeError', () => Promise.resolve());
    const fail = createFunctionFail({ isEnterpriseInstall: false, functionExecutionId: 'Fx1234' }, client);

    assert.strictEqual(fail.hasBeenCalled(), false, 'hasBeenCalled should be false initially');

    await fail({ error: 'boom' });
    assert.ok(fail.hasBeenCalled(), 'hasBeenCalled should be true after calling the function');
  });
});
