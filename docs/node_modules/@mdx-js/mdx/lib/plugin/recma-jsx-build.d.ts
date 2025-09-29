/**
 * A plugin to build JSX into function calls.
 * `estree-util-build-jsx` does all the work for us!
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export function recmaJsxBuild(options?: Readonly<Options> | null | undefined): (tree: Program, file: VFile) => undefined;
export type Program = import('estree-jsx').Program;
export type BuildJsxOptions = import('estree-util-build-jsx').Options;
export type VFile = import('vfile').VFile;
/**
 * Configuration for internal plugin `recma-jsx-build`.
 */
export type ExtraOptions = {
    /**
     * Whether to keep the import of the automatic runtime or get it from
     * `arguments[0]` instead (default: `'program'`).
     */
    outputFormat?: 'function-body' | 'program' | null | undefined;
};
/**
 * Options.
 */
export type Options = BuildJsxOptions & ExtraOptions;
//# sourceMappingURL=recma-jsx-build.d.ts.map