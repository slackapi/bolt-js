import SchemaTypes from "./schema_types";
import SlackSchema from "./slack/mod";

const Schema = {
  // Contains primitive types
  types: SchemaTypes,
  // Contains slack-specific schema types
  slack: SlackSchema,
} as const;

export default Schema;
