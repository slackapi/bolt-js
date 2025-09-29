/**
 * Run code compiled with `outputFormat: 'function-body'`.
 *
 * > ☢️ **Danger**: this `eval`s JavaScript.
 *
 * @param {{toString(): string}} code
 *   JavaScript function body to run.
 * @param {RunOptions} options
 *   Configuration (**required**).
 * @return {Promise<MDXModule>}
 *   Promise to a module;
 *   the result is an object with a `default` field set to the component;
 *   anything else that was exported is available too.
 */
export function run(code: {
    toString(): string;
}, options: RunOptions): Promise<MDXModule>;
/**
 * Run code, synchronously.
 *
 * When possible please use the async `run`.
 *
 * > ☢️ **Danger**: this `eval`s JavaScript.
 *
 * @param {{toString(): string}} code
 *   JavaScript function body to run.
 * @param {RunOptions} options
 *   Configuration (**required**).
 * @return {MDXModule}
 *   Module.
 */
export function runSync(code: {
    toString(): string;
}, options: RunOptions): MDXModule;
export type MDXModule = import('mdx/types.js').MDXModule;
export type RunOptions = import('./util/resolve-evaluate-options.js').RunOptions;
//# sourceMappingURL=run.d.ts.map