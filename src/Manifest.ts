import { 
  SlackManifest,
  SlackManifestType,
  DefineFunction,
  DefineWorkflow,
  DefineType,
  Schema,
  ManifestSchema,
  DefineOAuth2Provider,
} from '@slack/deno-slack-sdk';

export const Manifest = (definition: SlackManifestType): ManifestSchema => {
  const manifest = new SlackManifest(definition);
  return manifest.export();
};

// pass through re-export
export type { 
  SlackManifest,
  SlackManifestType,
  DefineFunction,
  DefineWorkflow,
  DefineType,
  Schema,
  DefineOAuth2Provider
};