import { ParamReference } from "./param";

export const WithUntypedObjectProxy = (
  // deno-lint-ignore no-explicit-any
  rootObject: Record<string, any>,
  ...path: (string | undefined)[]
  // deno-lint-ignore no-explicit-any
): any => {
  const parameterizedObject = {
    ...rootObject,
    ...ParamReference(...path),
  };

  const proxy = new Proxy(parameterizedObject, {
    get: function (obj, prop) {
      // If it's a property that exists, just access it directly
      if (prop in obj) {
        // deno-lint-ignore no-explicit-any
        return Reflect.get.apply(obj, arguments as any);
      }

      // We're attempting to access a property that doesn't exist, so create a new nested proxy
      if (typeof prop === "string") {
        return WithUntypedObjectProxy(obj, ...path, prop);
      }

      // Fallback to trying to access it directly even if it's not in this objects props
      // deno-lint-ignore no-explicit-any
      return Reflect.get.apply(obj, arguments as any);
    },
  });

  return proxy;
};
