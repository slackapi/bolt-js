import { SlackManifest } from "../manifest";
import { ManifestCustomTypeSchema } from "../types";
import { CustomTypeDefinition, ICustomType } from "./types";

export const DefineType = <Def extends CustomTypeDefinition>(
  definition: Def,
) => {
  return new CustomType(definition);
};

export class CustomType<Def extends CustomTypeDefinition>
  implements ICustomType {
  public id: string;
  public title: string | undefined;
  public description: string | undefined;

  constructor(
    public definition: Def,
  ) {
    this.id = definition.callback_id;
    this.definition = definition;
    this.description = definition.description;
    this.title = definition.title;
  }

  private generateReferenceString() {
    return `#/types/${this.id}`;
  }

  toString() {
    return this.generateReferenceString();
  }
  toJSON() {
    return this.generateReferenceString();
  }

  registerParameterTypes(manifest: SlackManifest) {
    if ("items" in this.definition) {
      // Register the item if its a type
      if (this.definition.items.type instanceof Object) {
        manifest.registerType(this.definition.items.type);
      }
      // } else if ("properties" in this.definition) {
      //   // Loop through the properties and register any types
      //   Object.values(this.definition.properties)?.forEach((property) => {
      //     if ("type" in property && property.type instanceof Object) {
      //       manifest.registerType(property.type);
      //     }
      //   });
    } else if (this.definition.type instanceof Object) {
      // The referenced type is a Custom Type
      manifest.registerType(this.definition.type);
    }
  }
  export(): ManifestCustomTypeSchema {
    // remove callback_id from the definition we pass to the manifest
    const { callback_id: _c, ...definition } = this.definition;
    return definition;
  }
}
