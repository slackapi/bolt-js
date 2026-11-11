import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, type Mock, mock } from 'node:test';
import { WebClient } from '@slack/web-api';
import { createSetStatus } from '../../../src/context';

describe('createSetStatus', () => {
  const client = new WebClient('token');
  let setStatusStub: Mock<WebClient['assistant']['threads']['setStatus']>;

  beforeEach(() => {
    setStatusStub = mock.method(client.assistant.threads, 'setStatus', () => Promise.resolve({ ok: true }));
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it('should call client.assistant.threads.setStatus with string status', () => {
    const setStatus = createSetStatus(client, 'C1234', '1234.5678');
    setStatus('is thinking...');

    assert.strictEqual(setStatusStub.mock.callCount(), 1);
    const args = setStatusStub.mock.calls[0].arguments[0];

    assert.equal(args.channel_id, 'C1234');
    assert.equal(args.thread_ts, '1234.5678');
    assert.equal(args.status, 'is thinking...');
  });

  it('should call client.assistant.threads.setStatus with object status', () => {
    const setStatus = createSetStatus(client, 'C1234', '1234.5678');
    setStatus({ status: 'is thinking...', loading_messages: ['Loading...', 'Still working...'] });

    assert.strictEqual(setStatusStub.mock.callCount(), 1);
    const args = setStatusStub.mock.calls[0].arguments[0];

    assert.equal(args.channel_id, 'C1234');
    assert.equal(args.thread_ts, '1234.5678');
    assert.equal(args.status, 'is thinking...');
    assert.deepEqual(args.loading_messages, ['Loading...', 'Still working...']);
  });

  it('should use the channel_id and thread_ts from factory creation', () => {
    const setStatus = createSetStatus(client, 'C9999', '9999.0000');
    setStatus('processing');

    assert.strictEqual(setStatusStub.mock.callCount(), 1);
    const args = setStatusStub.mock.calls[0].arguments[0];

    assert.equal(args.channel_id, 'C9999');
    assert.equal(args.thread_ts, '9999.0000');
  });
});
