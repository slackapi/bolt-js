import { AuthOptions } from './';

/**
 * Get the registry URL for a given npm scope
 *
 * @param scope - npm scope to resolve URL for
 * @param [npmrc] - Optional object of npmrc properties to use instead of looking up the users local npmrc file
 * @returns The resolved registry URL, falling back to the global npm registry
 */
declare function registryUrl(scope: string, npmrc?: Pick<AuthOptions, 'npmrc'>): string;

export = registryUrl;
