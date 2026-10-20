import { expectAssignable } from 'tsd';
import { Agent, ProxyAgent } from 'undici';
import type { SocketModeReceiverOptions } from '../../src';

expectAssignable<SocketModeReceiverOptions>({ appToken: 'xapp-token', dispatcher: new Agent() });
expectAssignable<SocketModeReceiverOptions>({
  appToken: 'xapp-token',
  dispatcher: new ProxyAgent('http://proxy:3128'),
});
