// import SchemaTypes from "../schema/schema_types";
import type {
  CustomTypeParameterDefinition,
  // TypedObjectParameterDefinition,
  TypedParameterDefinition,
  // UntypedObjectParameterDefinition,
} from "./types";
import { ParamReference } from "./param";
import { WithUntypedObjectProxy } from "./with-untyped-object-proxy";

export type ParameterDefinition = TypedParameterDefinition;

// Used for defining a set of input or output parameters
export type ParameterSetDefinition = {
  [key: string]: ParameterDefinition;
};

export type PossibleParameterKeys<
  ParameterSetInternal extends ParameterSetDefinition,
> = (keyof ParameterSetInternal)[];

export type ParameterPropertiesDefinition<
  Parameters extends ParameterSetDefinition,
  Required extends PossibleParameterKeys<Parameters>,
> = {
  properties: Parameters;
  required: Required;
};

export type ParameterVariableType<Def extends ParameterDefinition> = Def extends
  CustomTypeParameterDefinition // If the ParameterVariable is a Custom type, use it's definition instead
  ? ParameterVariableType<Def["type"]["definition"]>
  : // : Def extends TypedObjectParameterDefinition // If the ParameterVariable is of type object, allow access to the object's properties
  //   ? ObjectParameterVariableType<Def>
  // : Def extends UntypedObjectParameterDefinition
  //   ? UntypedObjectParameterVariableType
  SingleParameterVariable;

// deno-lint-ignore ban-types
type SingleParameterVariable = {};

// deno-lint-ignore no-explicit-any
type UntypedObjectParameterVariableType = any;

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

export const ParameterVariable = <P extends ParameterDefinition>(
  namespace: string,
  paramName: string,
  definition: P,
): ParameterVariableType<P> => {
  let param: (ParameterVariableType<P> | null) = null;

  // TODO: Should be able to use instanceof CustomType here
  if (definition.type instanceof Object) {
    param = ParameterVariable(
      namespace,
      paramName,
      definition.type.definition,
    ) as ParameterVariableType<P>;
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
  } else {
    param = CreateSingleParameterVariable(
      namespace,
      paramName,
    ) as ParameterVariableType<P>;
  }

  return param as ParameterVariableType<P>;
};

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

export const CreateUntypedObjectParameterVariable = (
  namespace: string,
  paramName: string,
): UntypedObjectParameterVariableType => {
  return WithUntypedObjectProxy(
    {},
    namespace,
    paramName,
  ) as UntypedObjectParameterVariableType;
};

const CreateSingleParameterVariable = (
  namespace: string,
  paramName: string,
): SingleParameterVariable => {
  return ParamReference(namespace, paramName) as SingleParameterVariable;
};
