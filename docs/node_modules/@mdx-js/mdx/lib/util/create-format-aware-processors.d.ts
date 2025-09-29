/**
 * Create smart processors to handle different formats.
 *
 * @param {Readonly<CompileOptions> | null | undefined} [compileOptions]
 *   Configuration (optional).
 * @return {FormatAwareProcessors}
 *   Smart processor.
 */
export function createFormatAwareProcessors(compileOptions?: Readonly<CompileOptions> | null | undefined): FormatAwareProcessors;
export type Program = import('estree-jsx').Program;
export type Root = import('mdast').Root;
export type Processor = import('unified').Processor<Root, Program, Program, Program, string>;
export type Compatible = import('vfile').Compatible;
export type VFile = import('vfile').VFile;
export type CompileOptions = import('../compile.js').CompileOptions;
/**
 * Result.
 */
export type FormatAwareProcessors = {
    /**
     *   Extensions to use.
     */
    extnames: ReadonlyArray<string>;
    /**
     *   Smart processor, async.
     */
    process: Process;
};
/**
 * Smart processor.
 */
export type Process = (vfileCompatible: Compatible) => Promise<VFile>;
//# sourceMappingURL=create-format-aware-processors.d.ts.map