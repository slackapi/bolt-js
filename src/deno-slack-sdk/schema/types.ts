type BaseSchemaType = {
  types?: {
    [key: string]: string;
  };
};

// Allow for sub-schema, i.e. schema.slack.types...
export type SchemaType = BaseSchemaType & {
  [key: string]: BaseSchemaType;
};
