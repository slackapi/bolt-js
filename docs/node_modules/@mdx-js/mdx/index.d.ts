export { createProcessor } from "./lib/core.js";
export { nodeTypes } from "./lib/node-types.js";
export type Fragment = import('./lib/util/resolve-evaluate-options.js').Fragment;
export type Jsx = import('./lib/util/resolve-evaluate-options.js').Jsx;
export type JsxDev = import('./lib/util/resolve-evaluate-options.js').JsxDev;
export type UseMdxComponents = import('./lib/util/resolve-evaluate-options.js').UseMdxComponents;
export type CompileOptions = import('./lib/compile.js').CompileOptions;
export type ProcessorOptions = import('./lib/core.js').ProcessorOptions;
export type EvaluateOptions = import('./lib/evaluate.js').EvaluateOptions;
export type RunOptions = import('./lib/run.js').RunOptions;
export { compile, compileSync } from "./lib/compile.js";
export { evaluate, evaluateSync } from "./lib/evaluate.js";
export { run, runSync } from "./lib/run.js";
//# sourceMappingURL=index.d.ts.map