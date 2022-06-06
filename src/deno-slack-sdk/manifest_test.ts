import { SlackManifestType } from "./types";

import { Manifest, SlackManifest } from "./manifest";
import { DefineDatastore, DefineFunction, DefineType, Schema } from "./mod";
import { assertEquals, assertStrictEquals } from "./dev_deps";

Deno.test("Manifest() property mappings", () => {
  const definition: SlackManifestType = {
    name: "fear and loathing in las vegas",
    description:
      "fear and loathing in las vegas: a savage journey to the heart of the american dream",
    backgroundColor: "#FFF",
    longDescription:
      "The book is a roman à clef, rooted in autobiographical incidents. The story follows its protagonist, Raoul Duke, and his attorney, Dr. Gonzo, as they descend on Las Vegas to chase the American Dream...",
    displayName: "fear and loathing",
    icon: "icon.png",
    botScopes: [],
  };
  let manifest = Manifest(definition);

  assertEquals(manifest.display_information, {
    name: definition.name,
    background_color: definition.backgroundColor,
    long_description: definition.longDescription,
    short_description: definition.description,
  });
  assertStrictEquals(manifest.icon, definition.icon);
  assertStrictEquals(
    manifest.features.bot_user.display_name,
    definition.displayName,
  );

  // If display_name is not defined on definition, should fall back to name
  delete definition.displayName;
  manifest = Manifest(definition);
  assertStrictEquals(
    manifest.features.bot_user.display_name,
    definition.name,
  );
});

// TODO: Re-add test to catch dup datastore names
// TODO: Re-add test for datastore columns

Deno.test("Manifest() automatically registers types used by function input and output parameters", () => {
  const inputTypeId = "test_input_type";
  const outputTypeId = "test_output_type";
  const stringTypeId = "test_string_type";

  const CustomStringType = DefineType({
    callback_id: stringTypeId,
    type: Schema.types.string,
  });

  const CustomInputType = DefineType({
    callback_id: inputTypeId,
    type: CustomStringType,
  });

  const CustomOutputType = DefineType({
    callback_id: outputTypeId,
    type: Schema.types.boolean,
  });

  const Function = DefineFunction(
    {
      callback_id: "test_function",
      title: "Function title",
      source_file: "functions/test_function",
      input_parameters: {
        properties: { aType: { type: CustomInputType } },
        required: [],
      },
      output_parameters: {
        properties: { aType: { type: CustomOutputType } },
        required: [],
      },
    },
  );

  const definition: SlackManifestType = {
    name: "Name",
    description: "Description",
    icon: "icon.png",
    longDescription: "LongDescription",
    botScopes: [],
    functions: [Function],
  };
  const manifest = Manifest(definition);
  assertEquals(definition.types, [
    CustomInputType,
    CustomOutputType,
    CustomStringType,
  ]);
  assertEquals(manifest.types, {
    [inputTypeId]: CustomInputType.export(),
    [stringTypeId]: CustomStringType.export(),
    [outputTypeId]: CustomOutputType.export(),
  });
});

Deno.test("Manifest() automatically registers types referenced by datastores", () => {
  const stringTypeId = "test_string_type";
  const StringType = DefineType({
    callback_id: stringTypeId,
    type: Schema.types.string,
  });

  const Store = DefineDatastore({
    name: "Test store",
    attributes: {
      aString: { type: StringType },
    },
    primary_key: "aString",
  });

  const definition: SlackManifestType = {
    name: "Name",
    description: "Description",
    icon: "icon.png",
    botScopes: [],
    datastores: [Store],
  };
  const manifest = Manifest(definition);
  assertEquals(definition.types, [StringType]);
  assertEquals(manifest.types, { [stringTypeId]: StringType.export() });
});

Deno.test("Manifest() automatically registers types referenced by other types", () => {
  // const objectTypeId = "test_object_type";
  const stringTypeId = "test_string_type";
  const booleanTypeId = "test_boolean_type";
  const arrayTypeId = "test_array_type";
  const customTypeId = "test_custom_type";

  const BooleanType = DefineType({
    callback_id: booleanTypeId,
    type: Schema.types.boolean,
  });

  const StringType = DefineType({
    callback_id: stringTypeId,
    type: Schema.types.string,
  });

  const CustomType = DefineType({
    callback_id: customTypeId,
    type: BooleanType,
  });

  // const ObjectType = DefineType(objectTypeId, {
  //   type: Schema.types.object,
  //   properties: {
  //     aString: { type: StringType },
  //   },
  // });

  const ArrayType = DefineType({
    callback_id: arrayTypeId,
    type: Schema.types.array,
    items: {
      // type: ObjectType,
      type: StringType,
    },
  });

  const definition: SlackManifestType = {
    name: "Name",
    description: "Description",
    icon: "icon.png",
    longDescription: "LongDescription",
    botScopes: [],
    types: [ArrayType, CustomType],
  };
  const manifest = Manifest(definition);

  assertEquals(definition.types, [
    ArrayType,
    CustomType,
    StringType,
    // ObjectType,
    BooleanType,
  ]);
  assertEquals(manifest.types, {
    [arrayTypeId]: ArrayType.export(),
    [customTypeId]: CustomType.export(),
    // [objectTypeId]: ObjectType.export(),
    [stringTypeId]: StringType.export(),
    [booleanTypeId]: BooleanType.export(),
  });
});

Deno.test("SlackManifest() registration functions don't allow duplicates", () => {
  const functionId = "test_function";
  const arrayTypeId = "test_array_type";
  // const objectTypeId = "test_object_type";
  const stringTypeId = "test_string_type";

  const CustomStringType = DefineType({
    callback_id: stringTypeId,
    type: Schema.types.string,
  });

  // const CustomObjectType = DefineType({
  //   callback_id: objectTypeId,
  //   type: Schema.types.object,
  //   properties: {
  //     aString: {
  //       type: CustomStringType,
  //     },
  //   },
  // });

  const CustomArrayType = DefineType({
    callback_id: arrayTypeId,
    type: Schema.types.array,
    items: {
      type: CustomStringType,
    },
  });

  const Func = DefineFunction({
    callback_id: functionId,
    title: "Function title",
    source_file: `functions/${functionId}.ts`,
  });

  const definition: SlackManifestType = {
    name: "Name",
    description: "Description",
    icon: "icon.png",
    longDescription: "LongDescription",
    botScopes: [],
    functions: [Func],
    types: [CustomArrayType],
    // types: [CustomObjectType],
  };

  const Manifest = new SlackManifest(definition);

  Manifest.registerFunction(Func);
  Manifest.registerFunction(Func);
  // Manifest.registerType(CustomObjectType);
  // Manifest.registerType(CustomObjectType);
  Manifest.registerType(CustomArrayType);
  Manifest.registerType(CustomStringType);

  const exportedManifest = Manifest.export();

  assertEquals(definition.functions, [Func]);
  assertEquals(exportedManifest.functions, { [functionId]: Func.export() });
  assertEquals(definition.types, [CustomArrayType, CustomStringType]);
  assertEquals(exportedManifest.types, {
    [arrayTypeId]: CustomArrayType.export(),
    [stringTypeId]: CustomStringType.export(),
  });
});

Deno.test("SlackManifest.export() ensures datastore scopes if they are not present", () => {
  const Store = DefineDatastore({
    name: "test store",
    attributes: {
      attr: {
        type: Schema.types.string,
      },
    },
    primary_key: "attr",
  });

  const definition: SlackManifestType = {
    name: "Name",
    description: "Description",
    icon: "icon.png",
    longDescription: "LongDescription",
    botScopes: [],
    datastores: [Store],
  };

  const Manifest = new SlackManifest(definition);
  const exportedManifest = Manifest.export();
  const botScopes = exportedManifest.oauth_config.scopes.bot;
  assertStrictEquals(botScopes.includes("datastore:read"), true);
  assertStrictEquals(botScopes.includes("datastore:write"), true);
});

Deno.test("SlackManifest.export() will not duplicate datastore scopes if they're already present", () => {
  const Store = DefineDatastore({
    name: "test store",
    attributes: {
      attr: {
        type: Schema.types.string,
      },
    },
    primary_key: "attr",
  });

  const definition: SlackManifestType = {
    name: "Name",
    description: "Description",
    icon: "icon.png",
    longDescription: "LongDescription",
    botScopes: ["datastore:read", "datastore:write"],
    datastores: [Store],
  };

  const Manifest = new SlackManifest(definition);
  const exportedManifest = Manifest.export();
  const botScopes = exportedManifest.oauth_config.scopes.bot;
  assertStrictEquals(
    botScopes.filter((scope) => scope === "datastore:read").length,
    1,
  );
  assertStrictEquals(
    botScopes.filter((scope) => scope === "datastore:write").length,
    1,
  );
});
