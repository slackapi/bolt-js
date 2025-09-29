/**
 * Create a file and options from a given `vfileCompatible` and options that
 * might contain `format: 'detect'`.
 *
 * @param {Readonly<Compatible>} vfileCompatible
 *   File.
 * @param {Readonly<CompileOptions> | null | undefined} [options]
 *   Configuration (optional).
 * @returns {{file: VFile, options: ProcessorOptions}}
 *   File and options.
 */
export function resolveFileAndOptions(vfileCompatible: Readonly<Compatible>, options?: Readonly<CompileOptions> | null | undefined): {
    file: VFile;
    options: ProcessorOptions;
};
export type Compatible = import('vfile').Compatible;
export type CompileOptions = import('../compile.js').CompileOptions;
export type ProcessorOptions = import('../core.js').ProcessorOptions;
import { VFile } from 'vfile';
//# sourceMappingURL=resolve-file-and-options.d.ts.map