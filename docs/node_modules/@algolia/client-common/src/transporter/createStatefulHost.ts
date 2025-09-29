import type { Host, StatefulHost } from '../types';

// By default, API Clients at Algolia have expiration delay of 5 mins.
// In the JavaScript client, we have 2 mins.
const EXPIRATION_DELAY = 2 * 60 * 1000;

export function createStatefulHost(host: Host, status: StatefulHost['status'] = 'up'): StatefulHost {
  const lastUpdate = Date.now();

  function isUp(): boolean {
    return status === 'up' || Date.now() - lastUpdate > EXPIRATION_DELAY;
  }

  function isTimedOut(): boolean {
    return status === 'timed out' && Date.now() - lastUpdate <= EXPIRATION_DELAY;
  }

  return { ...host, status, lastUpdate, isUp, isTimedOut };
}
