// import type { SlackEvent } from '@slack/types';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import { expectType } from 'tsd';
import { ErrorCode } from '../../../src/errors';
import { isSlackEventMiddlewareArgsOptions } from '../../../src/middleware/builtin';
// import { matchCommandName, matchEventType, onlyCommands, onlyEvents, subtype } from '../../../src/middleware/builtin';
import type { Context, SlackEventMiddlewareArgs, SlackEventMiddlewareArgsOptions } from '../../../src/types';
import {
  type Override,
  createDummyAppHomeOpenedEventMiddlewareArgs,
  createDummyAppMentionEventMiddlewareArgs,
  createDummyCommandMiddlewareArgs,
  createDummyMemberChannelEventMiddlewareArgs,
  createDummyMessageEventMiddlewareArgs,
  createDummyReactionAddedEventMiddlewareArgs,
  wrapMiddleware,
} from '../helpers';

interface DummyContext extends Context {
  matches?: RegExpExecArray;
}

// Dummy values
const dummyContext: DummyContext = { isEnterpriseInstall: false };
const ts = '1234.56';
const channel = 'C1234';

async function importBuiltin(overrides: Override = {}): Promise<typeof import('../../../src/middleware/builtin')> {
  return rewiremock.module(() => import('../../../src/middleware/builtin'), overrides);
}

describe('Built-in global middleware', () => {
  let builtins: Awaited<ReturnType<typeof importBuiltin>>;
  beforeEach(async () => {
    builtins = await importBuiltin();
  });
  describe('matchMessage()', () => {
    function matchesPatternTestCase(
      pattern: string | RegExp,
      event: SlackEventMiddlewareArgs<'message' | 'app_mention'>,
    ): Mocha.AsyncFunc {
      return async () => {
        const { matchMessage } = builtins;
        const middleware = matchMessage(pattern);
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(event, ctx);
        await middleware(args);

        sinon.assert.calledOnce(args.next);
        // The following assertion(s) check behavior that is only targeted at RegExp patterns
        if (typeof pattern !== 'string') {
          if (ctx.matches !== undefined) {
            assert.lengthOf(ctx.matches, 1);
          } else {
            assert.fail();
          }
        }
      };
    }

    function notMatchesPatternTestCase(
      pattern: string | RegExp,
      event: SlackEventMiddlewareArgs<'message' | 'app_mention'>,
    ): Mocha.AsyncFunc {
      return async () => {
        const { matchMessage } = builtins;
        const middleware = matchMessage(pattern);
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(event, ctx);
        await middleware(args);

        sinon.assert.notCalled(args.next);
        assert.notProperty(ctx, 'matches');
      };
    }

    describe('using a string pattern', () => {
      const pattern = 'foo';
      const matchingText = 'foobar';
      const nonMatchingText = 'bar';
      it(
        'should match message events with a pattern that matches',
        matchesPatternTestCase(pattern, createDummyMessageEventMiddlewareArgs({ text: matchingText })),
      );
      it(
        'should match app_mention events with a pattern that matches',
        matchesPatternTestCase(pattern, createDummyAppMentionEventMiddlewareArgs({ text: matchingText })),
      );
      it(
        'should filter out message events with a pattern that does not match',
        notMatchesPatternTestCase(pattern, createDummyMessageEventMiddlewareArgs({ text: nonMatchingText })),
      );
      it(
        'should filter out app_mention events with a pattern that does not match',
        notMatchesPatternTestCase(pattern, createDummyAppMentionEventMiddlewareArgs({ text: nonMatchingText })),
      );
      it(
        'should filter out message events which do not have text (block kit)',
        notMatchesPatternTestCase(
          pattern,
          createDummyMessageEventMiddlewareArgs({
            text: '',
            blocks: [
              {
                type: 'divider',
              },
            ],
          }),
        ),
      );
    });

    describe('using a RegExp pattern', () => {
      const pattern = /foo/;
      const matchingText = 'foobar';
      const nonMatchingText = 'bar';
      it(
        'should match message events with a pattern that matches',
        matchesPatternTestCase(pattern, createDummyMessageEventMiddlewareArgs({ text: matchingText })),
      );
      it(
        'should match app_mention events with a pattern that matches',
        matchesPatternTestCase(pattern, createDummyAppMentionEventMiddlewareArgs({ text: matchingText })),
      );
      it(
        'should filter out message events with a pattern that does not match',
        notMatchesPatternTestCase(pattern, createDummyMessageEventMiddlewareArgs({ text: nonMatchingText })),
      );
      it(
        'should filter out app_mention events with a pattern that does not match',
        notMatchesPatternTestCase(pattern, createDummyAppMentionEventMiddlewareArgs({ text: nonMatchingText })),
      );
      it(
        'should filter out message events which do not have text (block kit)',

        notMatchesPatternTestCase(
          pattern,
          createDummyMessageEventMiddlewareArgs({
            text: '',
            blocks: [
              {
                type: 'divider',
              },
            ],
          }),
        ),
      );
    });

    describe('directMention()', () => {
      it('should bail when the context does not provide a bot user ID', async () => {
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(createDummyMessageEventMiddlewareArgs(), ctx);

        let error: Error | undefined = undefined;
        try {
          await builtins.directMention(args);
        } catch (err) {
          error = err as Error;
        }

        assert.instanceOf(error, Error);
        assert.propertyVal(error, 'code', ErrorCode.ContextMissingPropertyError);
        assert.propertyVal(error, 'missingProperty', 'botUserId');
      });

      it('should match message events that mention the bot user ID at the beginning of message text', async () => {
        const fakeBotUserId = 'B123456';
        const messageText = `<@${fakeBotUserId}> hi`;
        const ctx = { ...dummyContext, botUserId: fakeBotUserId };
        const args = wrapMiddleware(createDummyMessageEventMiddlewareArgs({ text: messageText }), ctx);

        await builtins.directMention(args);

        sinon.assert.calledOnce(args.next);
      });

      it('should not match message events that do not mention the bot user ID', async () => {
        const fakeBotUserId = 'B123456';
        const messageText = 'hi';
        const ctx = { ...dummyContext, botUserId: fakeBotUserId };
        const args = wrapMiddleware(createDummyMessageEventMiddlewareArgs({ text: messageText }), ctx);

        await builtins.directMention(args);

        sinon.assert.notCalled(args.next);
      });

      it('should not match message events that mention the bot user ID NOT at the beginning of message text', async () => {
        const fakeBotUserId = 'B123456';
        const messageText = `hi <@${fakeBotUserId}> `;
        const ctx = { ...dummyContext, botUserId: fakeBotUserId };
        const args = wrapMiddleware(createDummyMessageEventMiddlewareArgs({ text: messageText }), ctx);

        await builtins.directMention(args);

        sinon.assert.notCalled(args.next);
      });

      it('should not match message events which do not have text (block kit)', async () => {
        const fakeBotUserId = 'B123456';
        const ctx = { ...dummyContext, botUserId: fakeBotUserId };
        const args = wrapMiddleware(createDummyMessageEventMiddlewareArgs({ blocks: [{ type: 'divider' }] }), ctx);

        await builtins.directMention(args);

        sinon.assert.notCalled(args.next);
      });

      it('should not match message events that contain a link to a conversation at the beginning', async () => {
        const fakeBotUserId = 'B123456';
        const messageText = '<#C1234> hi';
        const ctx = { ...dummyContext, botUserId: fakeBotUserId };
        const args = wrapMiddleware(createDummyMessageEventMiddlewareArgs({ text: messageText }), ctx);

        await builtins.directMention(args);

        sinon.assert.notCalled(args.next);
      });
    });

    describe('ignoreSelf()', () => {
      const fakeBotUserId = 'BUSER1';
      it('should continue middleware processing for non-event payloads', async () => {
        const ctx = { ...dummyContext, botUserId: fakeBotUserId, botId: fakeBotUserId };
        const args = wrapMiddleware(createDummyCommandMiddlewareArgs(), ctx);
        await builtins.ignoreSelf(args);
        sinon.assert.calledOnce(args.next);
      });

      it('should ignore message events identified as a bot message from the same bot ID as this app', async () => {
        const ctx = { ...dummyContext, botUserId: fakeBotUserId, botId: fakeBotUserId };
        const args = wrapMiddleware(
          createDummyMessageEventMiddlewareArgs({
            message: {
              bot_id: fakeBotUserId,
              channel,
              channel_type: 'channel',
              event_ts: ts,
              text: 'hi',
              type: 'message',
              ts,
              subtype: 'bot_message',
            },
          }),
          ctx,
        );
        await builtins.ignoreSelf(args);
        sinon.assert.notCalled(args.next);
      });

      it('should ignore events with only a botUserId', async () => {
        const ctx = { ...dummyContext, botUserId: fakeBotUserId };
        const args = wrapMiddleware(createDummyReactionAddedEventMiddlewareArgs({ user: fakeBotUserId }), ctx);
        await builtins.ignoreSelf(args);
        sinon.assert.notCalled(args.next);
      });

      it('should ignore events that match own app', async () => {
        const ctx = { ...dummyContext, botUserId: fakeBotUserId, botId: fakeBotUserId };
        const args = wrapMiddleware(createDummyReactionAddedEventMiddlewareArgs({ user: fakeBotUserId }), ctx);
        await builtins.ignoreSelf(args);
        sinon.assert.notCalled(args.next);
      });

      it('should not filter `member_joined_channel` and `member_left_channel` events originating from own app', async () => {
        const eventsWhichShouldNotBeFilteredOut = ['member_joined_channel', 'member_left_channel'] as const;
        const ctx = { ...dummyContext, botUserId: fakeBotUserId, botId: fakeBotUserId };

        const listOfFakeArgs = eventsWhichShouldNotBeFilteredOut.map((type) =>
          wrapMiddleware(createDummyMemberChannelEventMiddlewareArgs({ type, user: fakeBotUserId }), ctx),
        );

        await Promise.all(listOfFakeArgs.map(builtins.ignoreSelf));
        for (const args of listOfFakeArgs) {
          sinon.assert.calledOnce(args.next);
        }
      });
    });

    describe('onlyCommands', () => {
      it('should continue middleware processing for a command payload', async () => {
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(createDummyCommandMiddlewareArgs(), ctx);
        await builtins.onlyCommands(args);
        sinon.assert.calledOnce(args.next);
      });

      it('should ignore non-command payloads', async () => {
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(createDummyReactionAddedEventMiddlewareArgs(), ctx);
        await builtins.onlyCommands(args);
        sinon.assert.notCalled(args.next);
      });
    });

    describe('matchCommandName', () => {
      it('should continue middleware processing for requests that match exactly', async () => {
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(createDummyCommandMiddlewareArgs({ command: '/hi' }), ctx);
        await builtins.matchCommandName('/hi')(args);
        sinon.assert.calledOnce(args.next);
      });

      it('should continue middleware processing for requests that match a pattern', async () => {
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(createDummyCommandMiddlewareArgs({ command: '/hi' }), ctx);
        await builtins.matchCommandName(/h/)(args);
        sinon.assert.calledOnce(args.next);
      });

      it('should skip other requests', async () => {
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(createDummyCommandMiddlewareArgs({ command: '/hi' }), ctx);
        await builtins.matchCommandName('/will-not-match')(args);
        sinon.assert.notCalled(args.next);
      });
    });

    describe('onlyEvents', () => {
      it('should continue middleware processing for valid requests', async () => {
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(createDummyAppMentionEventMiddlewareArgs(), ctx);
        await builtins.onlyEvents(args);
        sinon.assert.calledOnce(args.next);
      });

      it('should skip other requests', async () => {
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(createDummyCommandMiddlewareArgs({ command: '/hi' }), ctx);
        await builtins.onlyEvents(args);
        sinon.assert.notCalled(args.next);
      });
    });

    describe('matchEventType', () => {
      it('should continue middleware processing for when event type matches', async () => {
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(createDummyAppMentionEventMiddlewareArgs(), ctx);
        await builtins.matchEventType('app_mention')(args);
        sinon.assert.calledOnce(args.next);
      });

      it('should continue middleware processing for if RegExp match occurs on event type', async () => {
        const ctx = { ...dummyContext };
        const appMentionArgs = wrapMiddleware(createDummyAppMentionEventMiddlewareArgs(), ctx);
        const appHomeArgs = wrapMiddleware(createDummyAppHomeOpenedEventMiddlewareArgs(), ctx);
        const middleware = builtins.matchEventType(/app_mention|app_home_opened/);
        await middleware(appMentionArgs);
        sinon.assert.calledOnce(appMentionArgs.next);
        await middleware(appHomeArgs);
        sinon.assert.calledOnce(appHomeArgs.next);
      });

      it('should skip non-matching event types', async () => {
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(createDummyAppMentionEventMiddlewareArgs(), ctx);
        await builtins.matchEventType('app_home_opened')(args);
        sinon.assert.notCalled(args.next);
      });

      it('should skip non-matching event types via RegExp', async () => {
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(createDummyAppMentionEventMiddlewareArgs(), ctx);
        await builtins.matchEventType(/foo/)(args);
        sinon.assert.notCalled(args.next);
      });
    });

    describe('subtype', () => {
      it('should continue middleware processing for match message subtypes', async () => {
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(
          createDummyMessageEventMiddlewareArgs({
            message: {
              bot_id: 'B1234',
              channel,
              channel_type: 'channel',
              event_ts: ts,
              text: 'hi',
              type: 'message',
              ts,
              subtype: 'bot_message',
            },
          }),
          ctx,
        );
        await builtins.subtype('bot_message')(args);
        sinon.assert.calledOnce(args.next);
      });

      it('should skip non-matching message subtypes', async () => {
        const ctx = { ...dummyContext };
        const args = wrapMiddleware(
          createDummyMessageEventMiddlewareArgs({
            message: {
              bot_id: 'B1234',
              channel,
              channel_type: 'channel',
              event_ts: ts,
              text: 'hi',
              type: 'message',
              ts,
              subtype: 'bot_message',
            },
          }),
          ctx,
        );
        await builtins.subtype('me_message')(args);
        sinon.assert.notCalled(args.next);
      });
    });
  });

  describe(isSlackEventMiddlewareArgsOptions.name, () => {
    it('should return true if object is SlackEventMiddlewareArgsOptions', async () => {
      const actual = isSlackEventMiddlewareArgsOptions({ autoAcknowledge: true });
      assert.isTrue(actual);
    });

    it('should narrow proper type if object is SlackEventMiddlewareArgsOptions', async () => {
      const option = { autoAcknowledge: true };
      if (isSlackEventMiddlewareArgsOptions({ autoAcknowledge: true })) {
        expectType<SlackEventMiddlewareArgsOptions>(option);
      } else {
        assert.fail(`${option} should be of type SlackEventMiddlewareArgsOption`);
      }
    });

    it('should return false if object is Middleware', async () => {
      const actual = isSlackEventMiddlewareArgsOptions(async () => {});
      assert.isFalse(actual);
    });
  });
});
