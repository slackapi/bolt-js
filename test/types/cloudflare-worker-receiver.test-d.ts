import { ConsoleLogger } from '@slack/logger';
import { expectAssignable } from 'tsd';
import { CloudflareWorkerReceiver, type CloudflareWorkerReceiverOptions } from '../../src';

expectAssignable<CloudflareWorkerReceiverOptions>({
  signingSecret: 'secret',
});

expectAssignable<CloudflareWorkerReceiver>(
  new CloudflareWorkerReceiver({
    signingSecret: 'secret',
    logger: new ConsoleLogger(),
  }),
);
