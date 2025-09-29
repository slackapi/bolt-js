import type {Nodes} from 'hast'
import type {VFile} from 'vfile'

export {raw} from './lib/index.js'

/**
 * Configuration.
 */
export interface Options {
  /**
   * Corresponding virtual file representing the input document (optional).
   */
  file?: VFile | null | undefined

  /**
   * List of custom hast node types to pass through (as in, keep) (optional).
   *
   * If the passed through nodes have children, those children are expected to
   * be hast again and will be handled.
   */
  passThrough?: Array<string> | null | undefined
}
