import { createAlgoliaAgent } from './createAlgoliaAgent';
import type { AlgoliaAgentOptions, AlgoliaAgent } from './types';

export type GetAlgoliaAgent = {
  algoliaAgents: AlgoliaAgentOptions[];
  client: string;
  version: string;
};

export function getAlgoliaAgent({ algoliaAgents, client, version }: GetAlgoliaAgent): AlgoliaAgent {
  const defaultAlgoliaAgent = createAlgoliaAgent(version).add({
    segment: client,
    version,
  });

  algoliaAgents.forEach((algoliaAgent) => defaultAlgoliaAgent.add(algoliaAgent));

  return defaultAlgoliaAgent;
}
