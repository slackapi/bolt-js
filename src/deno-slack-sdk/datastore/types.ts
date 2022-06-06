import { ICustomType } from "../types/types";
import { ManifestDatastoreSchema } from "../types";
import { SlackManifest } from "../manifest";

export type SlackDatastoreAttribute = {
  // supports custom types, primitive types, inline objects and lists
  type: string | ICustomType;
};

export type SlackDatastoreAttributes = Record<string, SlackDatastoreAttribute>;

export type SlackDatastoreDefinition<
  Name extends string,
  Attributes extends SlackDatastoreAttributes,
  PrimaryKey extends keyof Attributes,
> = {
  name: Name;
  "primary_key": PrimaryKey;
  attributes: Attributes;
};

export interface ISlackDatastore {
  name: string;
  export: () => ManifestDatastoreSchema;
  registerAttributeTypes: (manifest: SlackManifest) => void;
}

export type SlackDatastoreItem<Attributes extends SlackDatastoreAttributes> = {
  // TODO: In the future, see if we can map the attribute.type to
  // the TS type map like functions do w/ parameters
  // deno-lint-ignore no-explicit-any
  [k in keyof Attributes]: any;
};

export type PartialSlackDatastoreItem<
  Attributes extends SlackDatastoreAttributes,
> = OptionalPartial<Attributes>;

// deno-lint-ignore no-explicit-any
type OptionalPartial<T extends any> = {
  // deno-lint-ignore no-explicit-any
  [P in keyof T]?: any;
};
