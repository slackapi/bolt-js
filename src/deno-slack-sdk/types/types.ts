import { TypedParameterDefinition } from "../parameters/types";
import { SlackManifest } from "../manifest";
import { ManifestCustomTypeSchema } from "../types";

export type CustomTypeDefinition =
  & { callback_id: string }
  & TypedParameterDefinition;

export interface ICustomType {
  id: string;
  definition: CustomTypeDefinition;
  description?: string;
  registerParameterTypes: (manifest: SlackManifest) => void;
  export(): ManifestCustomTypeSchema;
}
