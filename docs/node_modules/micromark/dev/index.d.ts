export function micromark(
  value: Value,
  encoding: Encoding | null | undefined,
  options?: Options | null | undefined
): string
export function micromark(
  value: Value,
  options?: Options | null | undefined
): string
export {compile} from './lib/compile.js'
export {parse} from './lib/parse.js'
export {postprocess} from './lib/postprocess.js'
export {preprocess} from './lib/preprocess.js'
export type Encoding = import('micromark-util-types').Encoding
export type Options = import('micromark-util-types').Options
export type Value = import('micromark-util-types').Value
