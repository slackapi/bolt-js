/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { AppRenderer, SiteCollectedData } from './common';
import type { Manifest } from 'react-loadable-ssr-addon-v5-slorber';
import type { SSRTemplateCompiled } from './templates/templates';
export type SSGParams = {
    trailingSlash: boolean | undefined;
    manifest: Manifest;
    headTags: string;
    preBodyTags: string;
    postBodyTags: string;
    outDir: string;
    baseUrl: string;
    noIndex: boolean;
    DOCUSAURUS_VERSION: string;
    ssrTemplate: SSRTemplateCompiled;
};
export declare function loadAppRenderer({ serverBundlePath, }: {
    serverBundlePath: string;
}): Promise<AppRenderer>;
export declare function generateStaticFiles({ pathnames, renderer, params, }: {
    pathnames: string[];
    renderer: AppRenderer;
    params: SSGParams;
}): Promise<{
    collectedData: SiteCollectedData;
}>;
export declare function generateHashRouterEntrypoint({ content, params, }: {
    content: string;
    params: SSGParams;
}): Promise<void>;
