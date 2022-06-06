import SchemaTypes from "../schema/schema_types";
import { ICustomType } from "../types/types";

export type PrimitiveParameterDefinition =
  | BooleanParameterDefinition
  | StringParameterDefinition
  // | NumberParameterDefinition
  // | IntegerParameterDefinition
  | BaseParameterDefinition<AllValues>
  // | UntypedArrayParameterDefinition
  | TypedArrayParameterDefinition;

export type TypedParameterDefinition =
  // | TypedObjectParameterDefinition
  // | UntypedObjectParameterDefinition
  PrimitiveParameterDefinition;

export type CustomTypeParameterDefinition =
  & BaseParameterDefinition<AllValues>
  & {
    type: ICustomType;
  };

// A type is either a string, or a Custom Type!
type BaseParameterDefinition<T> = {
  /** Defines the parameter type. */
  type: string | ICustomType;
  /** An optional parameter title. */
  title?: string;
  /** An optional parameter description. */
  description?: string;
  /** An optional parameter default value. */
  default?: T;
  /** An option list of examples; intended for future use in a possible app type schemas page. */
  examples?: T[];
};

// export type UntypedObjectParameterDefinition =
//   & BaseParameterDefinition<ObjectValue>
//   & {
//     type: typeof SchemaTypes.object;
//   };

// TODO: Required field should be limited to the names(key) of each property
// export type TypedObjectParameterDefinition =
//   & UntypedObjectParameterDefinition
//   & {
//     /** A list of required property names (must reference names defined on the `properties` property). Only for use with Object types. */
//     required?: string[];
//     /** Whether the parameter can accept objects with additional keys beyond those defined via `properties` */
//     additionalProperties?: boolean;
//     /** Object defining what properties are allowed on the parameter. */
//     properties: {
//       [key: string]: PrimitiveParameterDefinition;
//     };
// };

type BooleanParameterDefinition = BaseParameterDefinition<boolean> & {
  type: typeof SchemaTypes.boolean;
};

type StringParameterDefinition = BaseParameterDefinition<string> & {
  type: typeof SchemaTypes.string;
  /** Minimum number of characters comprising the string */
  minLength?: number;
  /** Maximum number of characters comprising the string */
  maxLength?: number;
  /** Constrain the available string options to just the list of strings denoted in the `enum` property. Usage of `enum` also instructs any UI that collects a value for this parameter to render a dropdown select input rather than a free-form text input. */
  enum?: string[];
  /** Defines labels that correspond to the `enum` values. */
  choices?: EnumChoice<string>[];
};

// type IntegerParameterDefinition = BaseParameterDefinition<number> & {
//   type: typeof SchemaTypes.integer;
//   /** Absolute minimum acceptable value for the integer */
//   minimum?: number;
//   /** Absolute maximum acceptable value for the integer */
//   maximum?: number;
//   /** Constrain the available integer options to just the list of integers denoted in the `enum` property. Usage of `enum` also instructs any UI that collects a value for this parameter to render a dropdown select input rather than a free-form text input. */
//   enum?: number[];
//   /** Defines labels that correspond to the `enum` values. */
//   choices?: EnumChoice<number>[];
// };

// type NumberParameterDefinition = BaseParameterDefinition<number> & {
//   type: typeof SchemaTypes.number;
//   /** Absolute minimum acceptable value for the number */
//   minimum?: number;
//   /** Absolute maximum acceptable value for the number */
//   maximum?: number;
//   /** Constrain the available number options to just the list of numbers denoted in the `enum` property. Usage of `enum` also instructs any UI that collects a value for this parameter to render a dropdown select input rather than a free-form text input. */
//   enum?: number[];
//   /** Defines labels that correspond to the `enum` values. */
//   choices?: EnumChoice<number>[];
// };

type EnumChoice<T> = {
  /** The `enum` value this {@link EnumChoice} corresponds to. */
  value: T;
  /** The label to display for this {@link EnumChoice}. */
  title: string;
  /** An optional description for this {@link EnumChoice}. Intended for potential future use in a possible app type schemas page. */
  description?: string;
};

export type UntypedArrayParameterDefinition =
  & BaseParameterDefinition<ArrayValue>
  & {
    type: typeof SchemaTypes.array;
    /** Minimum number of items comprising the array */
    minItems?: number;
    /** Maximum number of items comprising the array */
    maxItems?: number;
  };
export type TypedArrayParameterDefinition = UntypedArrayParameterDefinition & {
  /** Defines the type of the items contained within the array parameter. */
  items: TypedParameterDefinition;
};

type AllValues = AllPrimitiveValues | ObjectValue | ArrayValue;

type AllPrimitiveValues = string | number | boolean;

type ObjectValue = {
  [key: string]: AllPrimitiveValues | AllPrimitiveValues[];
};

// TODO: Add object and create an union type when its available
type ArrayValue = AllPrimitiveValues[];
