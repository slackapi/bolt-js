import { WebClient } from '@slack/web-api';
import { assert } from 'chai';
import sinon from 'sinon';
import { createSay } from '../../../src/context';

describe('createSay', () => {
  it('should call chat.postMessage with text when given a string', async () => {
    const client = new WebClient('token');
    const postMessageStub = sinon
      .stub(client.chat, 'postMessage')
      .resolves({} as Awaited<ReturnType<typeof client.chat.postMessage>>);

    const say = createSay(client, 'C1234');
    await say('hello');

    assert(postMessageStub.calledOnce);
    const args = postMessageStub.firstCall.args[0] as unknown as Record<string, unknown>;
    assert.equal(args.text, 'hello');
    assert.equal(args.channel, 'C1234');
  });

  it('should call chat.postMessage with message object when given an object', async () => {
    const client = new WebClient('token');
    const postMessageStub = sinon
      .stub(client.chat, 'postMessage')
      .resolves({} as Awaited<ReturnType<typeof client.chat.postMessage>>);

    const say = createSay(client, 'C1234');
    await say({ text: 'hello', thread_ts: '1234.5678' });

    assert(postMessageStub.calledOnce);
    const args = postMessageStub.firstCall.args[0] as unknown as Record<string, unknown>;
    assert.equal(args.text, 'hello');
    assert.equal(args.channel, 'C1234');
    assert.equal(args.thread_ts, '1234.5678');
  });

  it('should override channel with the provided channelId', async () => {
    const client = new WebClient('token');
    const postMessageStub = sinon
      .stub(client.chat, 'postMessage')
      .resolves({} as Awaited<ReturnType<typeof client.chat.postMessage>>);

    const say = createSay(client, 'C1234');
    await say({ text: 'hello', channel: 'C9999' });

    assert(postMessageStub.calledOnce);
    const args = postMessageStub.firstCall.args[0] as unknown as Record<string, unknown>;
    assert.equal(args.channel, 'C1234');
  });
});
