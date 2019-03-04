import { processMiddleware } from '../src/middleware/process';
import { SlackCommandMiddlewareArgs } from '../src/middleware/types';

const dummyCommand: SlackCommandMiddlewareArgs = {
  payload: {
    token: '',
    command: '',
    text: 'a',
    response_url: 'a',
    trigger_id: 'a',
    user_id: 'a',
    user_name: 'a',
    team_id: 'a',
    team_domain: 'a',
    channel_id: 'a',
    channel_name: 'a',
  },
  command: {
    token: '',
    command: '',
    text: 'a',
    response_url: 'a',
    trigger_id: 'a',
    user_id: 'a',
    user_name: 'a',
    team_id: 'a',
    team_domain: 'a',
    channel_id: 'a',
    channel_name: 'a',
  },
  body: {
    token: '',
    command: '',
    text: 'a',
    response_url: 'a',
    trigger_id: 'a',
    user_id: 'a',
    user_name: 'a',
    team_id: 'a',
    team_domain: 'a',
    channel_id: 'a',
    channel_name: 'a',
  },
};

processMiddleware(
  dummyCommand,
  [
    ({ next }) => {
      next((error, done) => { console.log('post-process one'); done(error); });
    },
    ({ next }) => {
      // next(new Error('f'));
      next((error, done) => { console.log('post-process two'); done(error); });
    },
    ({ next }) => {
      console.log(next);
      // next();
      console.log('last middleware');
    },
  ],
  (context, args, startBubble) => {
    console.log('context', context);
    console.log('args', args);
    startBubble();
  },
  (error) => {
    console.log('after post-process');
    console.log(error);
  },
  {},
);
