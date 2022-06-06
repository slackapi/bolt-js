import { assertStrictEquals } from "../dev_deps";
import { DefineDatastore } from "./mod";
import SchemaTypes from "../schema/schema_types";
import { DefineType } from "../types/mod";

const customType = DefineType({
  callback_id: "custom_type",
  type: SchemaTypes.boolean,
});

Deno.test("Datastore sets appropriate defaults", () => {
  const datastore = DefineDatastore({
    name: "dinos",
    primary_key: "attr1",
    attributes: {
      attr1: {
        type: SchemaTypes.string,
      },
      attr2: {
        type: SchemaTypes.boolean,
      },
      attr3: {
        type: customType,
      },
    },
  });

  const exported = datastore.export();
  assertStrictEquals(exported.primary_key, "attr1");
  assertStrictEquals(exported.attributes.attr1.type, SchemaTypes.string);
  assertStrictEquals(exported.attributes.attr2.type, SchemaTypes.boolean);
  assertStrictEquals(exported.attributes.attr3.type, customType);
});
