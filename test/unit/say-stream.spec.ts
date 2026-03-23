import type { WebClient } from '@slack/web-api';
import { assert } from 'chai';
import sinon from 'sinon';
import { createSayStream } from '../../src/say-stream';

const defaultContext = { teamId: 'T1234', userId: 'U1234', isEnterpriseInstall: false };

describe('say-stream', () => {
  describe('createSayStream', () => {
    it('should return a function', () => {
      const fakeClient = { chatStream: sinon.fake() } as unknown as WebClient;
      const sayStream = createSayStream({
        channelId: 'C1234',
        client: fakeClient,
        context: defaultContext,
        body: { event: { ts: '1234.56' } },
      });
      assert.isFunction(sayStream);
    });

    it('should call client.chatStream with defaults from context', () => {
      const fakeClient = { chatStream: sinon.fake() } as unknown as WebClient;
      const sayStream = createSayStream({
        channelId: 'C1234',
        client: fakeClient,
        context: defaultContext,
        body: { event: { thread_ts: '1111.00', ts: '2222.00' } },
      });

      sayStream();

      sinon.assert.calledWith(fakeClient.chatStream as sinon.SinonSpy, {
        channel: 'C1234',
        thread_ts: '1111.00',
        recipient_team_id: 'T1234',
        recipient_user_id: 'U1234',
        buffer_size: undefined,
      });
    });

    it('should fall back to event.ts when thread_ts is not present', () => {
      const fakeClient = { chatStream: sinon.fake() } as unknown as WebClient;
      const sayStream = createSayStream({
        channelId: 'C1234',
        client: fakeClient,
        context: defaultContext,
        body: { event: { ts: '2222.00' } },
      });

      sayStream();

      sinon.assert.calledWith(fakeClient.chatStream as sinon.SinonSpy, sinon.match({ thread_ts: '2222.00' }));
    });

    it('should allow user-provided overrides', () => {
      const fakeClient = { chatStream: sinon.fake() } as unknown as WebClient;
      const sayStream = createSayStream({
        channelId: 'C1234',
        client: fakeClient,
        context: defaultContext,
        body: { event: { thread_ts: '1111.00', ts: '2222.00' } },
      });

      sayStream({
        channel: 'C9999',
        thread_ts: '9999.00',
        recipient_team_id: 'T9999',
        recipient_user_id: 'U9999',
        buffer_size: 512,
      });

      sinon.assert.calledWith(fakeClient.chatStream as sinon.SinonSpy, {
        channel: 'C9999',
        thread_ts: '9999.00',
        recipient_team_id: 'T9999',
        recipient_user_id: 'U9999',
        buffer_size: 512,
      });
    });

    it('should reject when thread_ts cannot be determined', async () => {
      const fakeClient = { chatStream: sinon.fake() } as unknown as WebClient;
      const sayStream = createSayStream({
        channelId: 'C1234',
        client: fakeClient,
        context: defaultContext,
        body: { event: {} },
      });

      try {
        await sayStream();
        assert.fail('Expected sayStream() to throw');
      } catch (e) {
        assert.instanceOf(e, Error);
        assert.include((e as Error).message, 'sayStream requires a thread_ts');
      }
    });

    it('should not reject when thread_ts is provided as an override', async () => {
      const fakeClient = { chatStream: sinon.fake() } as unknown as WebClient;
      const sayStream = createSayStream({
        channelId: 'C1234',
        client: fakeClient,
        context: defaultContext,
        body: { event: {} },
      });

      await sayStream({ thread_ts: '1234.56' });
    });

    it('should extract thread_ts from assistant_thread for assistant events', () => {
      const fakeClient = { chatStream: sinon.fake() } as unknown as WebClient;
      const sayStream = createSayStream({
        channelId: 'C1234',
        client: fakeClient,
        context: defaultContext,
        body: {
          event: {
            type: 'assistant_thread_started',
            assistant_thread: { channel_id: 'C1234', thread_ts: '3333.00' },
          },
        },
      });

      sayStream();

      sinon.assert.calledWith(fakeClient.chatStream as sinon.SinonSpy, sinon.match({ thread_ts: '3333.00' }));
    });

    it('should use enterpriseId as recipient_team_id when teamId is absent', () => {
      const fakeClient = { chatStream: sinon.fake() } as unknown as WebClient;
      const sayStream = createSayStream({
        channelId: 'C1234',
        client: fakeClient,
        context: { enterpriseId: 'E1234', isEnterpriseInstall: true },
        body: { event: { ts: '1111.00' } },
      });

      sayStream();

      sinon.assert.calledWith(
        fakeClient.chatStream as sinon.SinonSpy,
        sinon.match({ recipient_team_id: 'E1234', recipient_user_id: undefined }),
      );
    });
  });
});
