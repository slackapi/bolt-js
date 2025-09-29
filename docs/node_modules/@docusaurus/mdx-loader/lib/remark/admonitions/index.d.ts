type Plugin = any;
export type AdmonitionOptions = {
    keywords: string[];
    extendDefaults: boolean;
};
export declare const DefaultAdmonitionOptions: AdmonitionOptions;
export declare function normalizeAdmonitionOptions(providedOptions: Partial<AdmonitionOptions> | true): AdmonitionOptions;
declare const plugin: Plugin;
export default plugin;
//# sourceMappingURL=index.d.ts.map