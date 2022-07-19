import { 
  SlackManifest,
  SlackManifestType,
  DefineFunction,
  DefineWorkflow,
  DefineType,
  Schema,
  ManifestSchema
} from '@slack/deno-slack-sdk';

export const Manifest = (definition: SlackManifestType): ManifestSchema => {
  const manifest = new SlackManifest(definition);
  return manifest.export();
};

// pass through re-export
export type { 
  SlackManifestType,
  DefineFunction,
  DefineWorkflow,
  DefineType,
  Schema
};