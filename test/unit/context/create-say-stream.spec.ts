import { WebClient } from '@slack/web-api';
import { assert } from 'chai';
import sinon from 'sinon';
import { createSayStream } from '../../../src/context';
import type { Context } from '../../../src/types';

describe('createSayStream', () => {
  it('should call client.chatStream with defaults when called with no args', () => {
    const client = new WebClient('token');
    const chatStreamStub = sinon.stub(client, 'chatStream').returns({} as ReturnType<WebClient['chatStream']>);

    const ctx = { teamId: 'T1234', userId: 'U1234', isEnterpriseInstall: false } as Context;
    const sayStream = createSayStream(client, ctx, 'C1234', '1234.5678');
    sayStream();

    assert(chatStreamStub.calledOnce);
    const args = chatStreamStub.firstCall.args[0] as Record<string, unknown>;
    assert.equal(args.channel, 'C1234');
    assert.equal(args.thread_ts, '1234.5678');
    assert.equal(args.recipient_team_id, 'T1234');
    assert.equal(args.recipient_user_id, 'U1234');
  });

  it('should allow call-time args to override defaults', () => {
    const client = new WebClient('token');
    const chatStreamStub = sinon.stub(client, 'chatStream').returns({} as ReturnType<WebClient['chatStream']>);

    const ctx = { teamId: 'T1234', userId: 'U1234', isEnterpriseInstall: false } as Context;
    const sayStream = createSayStream(client, ctx, 'C1234', '1234.5678');
    sayStream({
      channel: 'C9999',
      thread_ts: '9999.0000',
      recipient_team_id: 'T9999',
      recipient_user_id: 'U9999',
    });

    assert(chatStreamStub.calledOnce);
    const args = chatStreamStub.firstCall.args[0] as Record<string, unknown>;
    assert.equal(args.channel, 'C9999');
    assert.equal(args.thread_ts, '9999.0000');
    assert.equal(args.recipient_team_id, 'T9999');
    assert.equal(args.recipient_user_id, 'U9999');
  });

  it('should pass through buffer_size when provided', () => {
    const client = new WebClient('token');
    const chatStreamStub = sinon.stub(client, 'chatStream').returns({} as ReturnType<WebClient['chatStream']>);

    const sayStream = createSayStream(client, { isEnterpriseInstall: false } as Context, 'C1234', '1234.5678');
    sayStream({ buffer_size: 512 });

    assert(chatStreamStub.calledOnce);
    const args = chatStreamStub.firstCall.args[0] as Record<string, unknown>;
    assert.equal(args.buffer_size, 512);
  });

  it('should throw when no thread_ts can be determined', () => {
    const client = new WebClient('token');
    sinon.stub(client, 'chatStream').returns({} as ReturnType<WebClient['chatStream']>);

    const sayStream = createSayStream(client, { isEnterpriseInstall: false } as Context, 'C1234');
    assert.throws(
      () => sayStream(),
      'sayStream requires a thread_ts but none could be determined from the event context',
    );
  });

  it('should use enterpriseId when teamId is not available', () => {
    const client = new WebClient('token');
    const chatStreamStub = sinon.stub(client, 'chatStream').returns({} as ReturnType<WebClient['chatStream']>);

    const sayStream = createSayStream(
      client,
      { enterpriseId: 'E1234', isEnterpriseInstall: false } as Context,
      'C1234',
      '1234.5678',
    );
    sayStream();

    assert(chatStreamStub.calledOnce);
    const args = chatStreamStub.firstCall.args[0] as Record<string, unknown>;
    assert.equal(args.recipient_team_id, 'E1234');
  });
});
