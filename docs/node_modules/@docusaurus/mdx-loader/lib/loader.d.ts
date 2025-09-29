/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { ResolveMarkdownLink } from './remark/resolveMarkdownLinks';
import type { MDXOptions } from './processor';
import type { MarkdownConfig } from '@docusaurus/types';
import type { LoaderContext } from 'webpack';
type Pluggable = any;
export type MDXPlugin = Pluggable;
export type Options = Partial<MDXOptions> & {
    markdownConfig: MarkdownConfig;
    staticDirs: string[];
    siteDir: string;
    isMDXPartial?: (filePath: string) => boolean;
    isMDXPartialFrontMatterWarningDisabled?: boolean;
    removeContentTitle?: boolean;
    metadataPath?: string | ((filePath: string) => string);
    createAssets?: (metadata: {
        frontMatter: {
            [key: string]: unknown;
        };
        metadata: {
            [key: string]: unknown;
        };
    }) => {
        [key: string]: unknown;
    };
    resolveMarkdownLink?: ResolveMarkdownLink;
};
export declare function mdxLoader(this: LoaderContext<Options>, fileContent: string): Promise<void>;
export {};
//# sourceMappingURL=loader.d.ts.map