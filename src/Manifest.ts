import {
  SlackManifest,
  SlackManifestType,
  DefineFunction,
  DefineWorkflow,
  DefineType,
  Schema,
  ManifestSchema,
  DefineOAuth2Provider,
  DefineDatastore,
} from '@slack/deno-slack-sdk';

export const Manifest = (definition: SlackManifestType): ManifestSchema => {
  const manifest = new SlackManifest(definition);
  return manifest.export();
};

// pass through re-export
export {
  DefineFunction,
  DefineWorkflow,
  DefineOAuth2Provider,
  Schema,
  SlackManifest,
  DefineType,
  DefineDatastore,
};

export type {
  SlackManifestType,
};
