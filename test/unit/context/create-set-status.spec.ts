import { WebClient } from '@slack/web-api';
import { assert } from 'chai';
import sinon from 'sinon';
import { createSetStatus } from '../../../src/context';

describe('createSetStatus', () => {
  const sandbox = sinon.createSandbox();
  const client = new WebClient('token');
  let setStatusStub: sinon.SinonStub;

  beforeEach(() => {
    setStatusStub = sandbox.stub(client.assistant.threads, 'setStatus').resolves({
      ok: true,
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call client.assistant.threads.setStatus with string status', () => {
    const setStatus = createSetStatus(client, 'C1234', '1234.5678');
    setStatus('is thinking...');

    assert(setStatusStub.calledOnce);
    const args = setStatusStub.firstCall.args[0];

    assert.equal(args.channel_id, 'C1234');
    assert.equal(args.thread_ts, '1234.5678');
    assert.equal(args.status, 'is thinking...');
  });

  it('should call client.assistant.threads.setStatus with object status', () => {
    const setStatus = createSetStatus(client, 'C1234', '1234.5678');
    setStatus({ status: 'is thinking...', loading_messages: ['Loading...', 'Still working...'] });

    assert(setStatusStub.calledOnce);
    const args = setStatusStub.firstCall.args[0];

    assert.equal(args.channel_id, 'C1234');
    assert.equal(args.thread_ts, '1234.5678');
    assert.equal(args.status, 'is thinking...');
    assert.deepEqual(args.loading_messages, ['Loading...', 'Still working...']);
  });

  it('should use the channel_id and thread_ts from factory creation', () => {
    const setStatus = createSetStatus(client, 'C9999', '9999.0000');
    setStatus('processing');

    assert(setStatusStub.calledOnce);
    const args = setStatusStub.firstCall.args[0];

    assert.equal(args.channel_id, 'C9999');
    assert.equal(args.thread_ts, '9999.0000');
  });
});
