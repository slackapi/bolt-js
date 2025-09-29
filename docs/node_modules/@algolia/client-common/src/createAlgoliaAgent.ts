import type { AlgoliaAgentOptions, AlgoliaAgent } from './types';

export function createAlgoliaAgent(version: string): AlgoliaAgent {
  const algoliaAgent = {
    value: `Algolia for JavaScript (${version})`,
    add(options: AlgoliaAgentOptions): AlgoliaAgent {
      const addedAlgoliaAgent = `; ${options.segment}${options.version !== undefined ? ` (${options.version})` : ''}`;

      if (algoliaAgent.value.indexOf(addedAlgoliaAgent) === -1) {
        algoliaAgent.value = `${algoliaAgent.value}${addedAlgoliaAgent}`;
      }

      return algoliaAgent;
    },
  };

  return algoliaAgent;
}
