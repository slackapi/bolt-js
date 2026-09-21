import { expectAssignable, expectNotAssignable } from 'tsd';
import type { ExpressReceiverOptions, HTTPReceiverOptions } from '../../src';

expectAssignable<HTTPReceiverOptions>({ signingSecret: 'secret', bodyLimit: 4194304 });
expectAssignable<ExpressReceiverOptions>({ signingSecret: 'secret', bodyLimit: 4194304 });

expectAssignable<HTTPReceiverOptions>({ signingSecret: 'secret', bodyLimit: '4mb' });
expectAssignable<ExpressReceiverOptions>({ signingSecret: 'secret', bodyLimit: '4mb' });

// bodyLimit is optional.
expectAssignable<HTTPReceiverOptions>({ signingSecret: 'secret' });
expectAssignable<ExpressReceiverOptions>({ signingSecret: 'secret' });

expectNotAssignable<HTTPReceiverOptions>({ signingSecret: 'secret', bodyLimit: true });
expectNotAssignable<ExpressReceiverOptions>({ signingSecret: 'secret', bodyLimit: true });
