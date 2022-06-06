import { SlackManifest } from "../manifest";
import { ManifestDatastoreSchema } from "../types";
import {
  ISlackDatastore,
  SlackDatastoreAttributes,
  SlackDatastoreDefinition,
} from "./types";

/**
 * Define a datastore and primary key and attributes for use in a Slack application.
 * @param {SlackDatastoreDefinition<string, SlackDatastoreAttributes, string>} definition Defines information about your datastore.
 * @returns {SlackDatastore}
 */
export const DefineDatastore = <
  Name extends string,
  Attributes extends SlackDatastoreAttributes,
  PrimaryKey extends keyof Attributes,
>(
  definition: SlackDatastoreDefinition<Name, Attributes, PrimaryKey>,
) => {
  return new SlackDatastore(definition);
};

export class SlackDatastore<
  Name extends string,
  Attributes extends SlackDatastoreAttributes,
  PrimaryKey extends keyof Attributes,
> implements ISlackDatastore {
  public name: Name;

  constructor(
    public definition: SlackDatastoreDefinition<Name, Attributes, PrimaryKey>,
  ) {
    this.name = definition.name;
  }

  registerAttributeTypes(manifest: SlackManifest) {
    Object.values(this.definition.attributes ?? {})?.forEach((attribute) => {
      if (attribute.type instanceof Object) {
        manifest.registerType(attribute.type);
      }
    });
  }

  export(): ManifestDatastoreSchema {
    return {
      primary_key: this.definition.primary_key as string,
      attributes: this.definition.attributes,
    };
  }
}
