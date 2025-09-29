/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { PluginContext, RedirectItem } from './types';
export type WriteFilesPluginContext = Pick<PluginContext, 'baseUrl' | 'outDir'>;
export type RedirectFile = {
    fileAbsolutePath: string;
    fileContent: string;
};
export declare function createToUrl(baseUrl: string, to: string): string;
export declare function toRedirectFiles(redirects: RedirectItem[], pluginContext: WriteFilesPluginContext, trailingSlash: boolean | undefined): RedirectFile[];
export declare function writeRedirectFile(file: RedirectFile): Promise<void>;
export default function writeRedirectFiles(redirectFiles: RedirectFile[]): Promise<void>;
