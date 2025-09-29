import type { SearchForFacetValuesResponse, SearchResponse, SearchParams } from '../types';
export declare function fetchAlgoliaResults<TRecord>({ searchClient, queries, userAgents, }: SearchParams): Promise<Array<SearchResponse<TRecord> | SearchForFacetValuesResponse>>;
