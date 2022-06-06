"use strict";
exports.__esModule = true;
exports.CreateUntypedObjectParameterVariable = exports.ParameterVariable = void 0;
var param_1 = require("./param");
var with_untyped_object_proxy_1 = require("./with-untyped-object-proxy");
// type ObjectParameterPropertyTypes<Def extends TypedObjectParameterDefinition> =
//   {
//     [name in keyof Def["properties"]]: ParameterVariableType<
//       Def["properties"][name]
//     >;
//   };
// If additionalProperties is set to true, allow access to any key
// Otherwise, only allow keys provided through use of properties
// type ObjectParameterVariableType<Def extends TypedObjectParameterDefinition> =
//   Def["additionalProperties"] extends true ?
//     & ObjectParameterPropertyTypes<Def>
//     & {
//       // deno-lint-ignore no-explicit-any
//       [key: string]: any;
//     }
//     : ObjectParameterPropertyTypes<Def>;
var ParameterVariable = function (namespace, paramName, definition) {
    var param = null;
    // TODO: Should be able to use instanceof CustomType here
    if (definition.type instanceof Object) {
        param = (0, exports.ParameterVariable)(namespace, paramName, definition.type.definition);
        // } else if (definition.type === SchemaTypes.object) {
        //   if ("properties" in definition) {
        //     param = CreateTypedObjectParameterVariable(
        //       namespace,
        //       paramName,
        //       definition,
        //     ) as ParameterVariableType<P>;
        //   } else {
        //     param = CreateUntypedObjectParameterVariable(namespace, paramName);
        //   }
    }
    else {
        param = CreateSingleParameterVariable(namespace, paramName);
    }
    return param;
};
exports.ParameterVariable = ParameterVariable;
// const CreateTypedObjectParameterVariable = <
//   P extends TypedObjectParameterDefinition,
// >(
//   namespace: string,
//   paramName: string,
//   definition: P,
// ): ObjectParameterVariableType<P> => {
//   const ns = namespace ? `${namespace}.` : "";
//   const pathReference = `${ns}${paramName}`;
//   const param = ParamReference(pathReference);
//   for (
//     const [propName, propDefinition] of Object.entries(
//       definition.properties || {},
//     )
//   ) {
//     param[propName as string] = ParameterVariable(
//       pathReference,
//       propName,
//       propDefinition,
//     );
//   }
//   // We wrap the typed object parameter w/ an untyped proxy to allow indexing into additional properties
//   return WithUntypedObjectProxy(
//     param,
//     namespace,
//     paramName,
//   ) as ObjectParameterVariableType<P>;
// };
var CreateUntypedObjectParameterVariable = function (namespace, paramName) {
    return (0, with_untyped_object_proxy_1.WithUntypedObjectProxy)({}, namespace, paramName);
};
exports.CreateUntypedObjectParameterVariable = CreateUntypedObjectParameterVariable;
var CreateSingleParameterVariable = function (namespace, paramName) {
    return (0, param_1.ParamReference)(namespace, paramName);
};
