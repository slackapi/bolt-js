import SchemaTypes from "../schema/schema_types";
import { ParameterVariable } from "./mod";
import { DefineType } from "../types/mod";
import { assertStrictEquals } from "../dev_deps";

Deno.test("ParameterVariable string", () => {
  const param = ParameterVariable("", "incident_name", {
    type: SchemaTypes.string,
  });

  assertStrictEquals(`${param}`, "{{incident_name}}");
});

// Deno.test("ParameterVariable typed object", () => {
//   const param = ParameterVariable("", "incident", {
//     type: SchemaTypes.object,
//     properties: {
//       id: {
//         type: SchemaTypes.integer,
//       },
//       name: {
//         type: SchemaTypes.string,
//       },
//     },
//   });

//   assertEquals(`${param}`, "{{incident}}");
//   assertEquals(`${param.id}`, "{{incident.id}}");
//   assertEquals(`${param.name}`, "{{incident.name}}");
// });

// Deno.test("ParameterVariable typed object with additional properties", () => {
//   const param = ParameterVariable("", "incident", {
//     type: SchemaTypes.object,
//     properties: {
//       id: {
//         type: SchemaTypes.integer,
//       },
//       name: {
//         type: SchemaTypes.string,
//       },
//     },
//     additionalProperties: true,
//   });

//   assertEquals(`${param}`, "{{incident}}");
//   assertEquals(`${param.id}`, "{{incident.id}}");
//   assertEquals(`${param.name}`, "{{incident.name}}");
//   assertEquals(`${param.foo.bar}`, "{{incident.foo.bar}}");
// });

// Deno.test("ParameterVariable untyped object", () => {
//   const param = ParameterVariable("", "incident", {
//     type: SchemaTypes.object,
//   });

//   assertEquals(`${param}`, "{{incident}}");
//   assertEquals(`${param.id}`, "{{incident.id}}");
//   assertEquals(`${param.name}`, "{{incident.name}}");
//   assertEquals(`${param.name.foo.bar}`, "{{incident.name.foo.bar}}");
// });

Deno.test("ParameterVariable array of strings", () => {
  const param = ParameterVariable("", "myArray", {
    type: SchemaTypes.array,
    items: {
      type: SchemaTypes.string,
    },
  });

  assertStrictEquals(`${param}`, "{{myArray}}");
});

Deno.test("ParameterVariable using CustomType string", () => {
  const customType = DefineType({
    callback_id: "customTypeString",
    type: SchemaTypes.string,
  });
  const param = ParameterVariable("", "myCustomTypeString", {
    type: customType,
  });

  assertStrictEquals(`${param}`, "{{myCustomTypeString}}");
});

// Deno.test("ParameterVariable using Custom Type typed object", () => {
//   const customType = DefineType({
//     callback_id: "customType",
//     type: SchemaTypes.object,
//     properties: {
//       aString: {
//         type: SchemaTypes.string,
//       },
//     },
//   });
//   const param = ParameterVariable("", "myCustomType", {
//     type: customType,
//   });

//   assertEquals(`${param}`, "{{myCustomType}}");
//   assertEquals(`${param.aString}`, "{{myCustomType.aString}}");
// });

// Deno.test("ParameterVariable using Custom Type untyped object", () => {
//   const customType = DefineType({
//     callback_id: "customTypeObject",
//     type: SchemaTypes.object,
//   });
//   const param = ParameterVariable("", "myCustomTypeObject", {
//     type: customType,
//   });

//   assertEquals(`${param}`, "{{myCustomTypeObject}}");
//   assertEquals(`${param.foo}`, "{{myCustomTypeObject.foo}}");
//   assertEquals(`${param.foo.bar}`, "{{myCustomTypeObject.foo.bar}}");
//   assertEquals(`${param.foo.bar.baz}`, "{{myCustomTypeObject.foo.bar.baz}}");
// });

Deno.test("ParameterVariable using Custom Type array", () => {
  const customType = DefineType({
    callback_id: "customTypeArray",
    type: SchemaTypes.array,
  });
  const param = ParameterVariable("", "myCustomTypeArray", {
    type: customType,
  });

  assertStrictEquals(`${param}`, "{{myCustomTypeArray}}");
});

// Deno.test("ParameterVariable using Custom Type object referencing another Custom Type", () => {
//   const StringType = DefineType({
//     callback_id: "stringType",
//     type: SchemaTypes.string,
//     minLength: 2,
//   });
//   const customType = DefineType({
//     callback_id: "customTypeWithCustomType",
//     type: SchemaTypes.object,
//     properties: {
//       customType: {
//         type: StringType,
//       },
//     },
//   });
//   const param = ParameterVariable("", "myNestedCustomType", {
//     type: customType,
//   });

//   assertEquals(`${param}`, "{{myNestedCustomType}}");
//   assertEquals(`${param.customType}`, "{{myNestedCustomType.customType}}");
// });

// Deno.test("ParameterVariable typed object with Custom Type property", () => {
//   const StringType = DefineType({
//     callback_id: "stringType",
//     type: SchemaTypes.string,
//     minLength: 2,
//   });

//   const param = ParameterVariable("", "myObjectParam", {
//     type: SchemaTypes.object,
//     properties: {
//       aString: {
//         type: StringType,
//       },
//     },
//   });

//   assertEquals(`${param}`, "{{myObjectParam}}");
//   assertEquals(`${param.aString}`, "{{myObjectParam.aString}}");
// });
