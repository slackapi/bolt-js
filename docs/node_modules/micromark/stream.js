/**
 * @typedef {import('micromark-util-types').Options} Options
 * @typedef {import('micromark-util-types').Value} Value
 * @typedef {import('micromark-util-types').Encoding} Encoding
 */

/**
 * @callback Callback
 *   Function called when write was successful.
 * @returns {undefined}
 *   Nothing.
 *
 * @typedef PipeOptions
 * @property {boolean | null | undefined} [end]
 *
 * @typedef {Omit<NodeJS.ReadableStream & NodeJS.WritableStream, 'isPaused' | 'pause' | 'read' | 'resume' | 'setEncoding' | 'unpipe' | 'unshift' | 'wrap'>} MinimalDuplex
 */

import {EventEmitter} from 'node:events'
import {compile} from './lib/compile.js'
import {parse} from './lib/parse.js'
import {postprocess} from './lib/postprocess.js'
import {preprocess} from './lib/preprocess.js'

/**
 * Create a duplex (readable and writable) stream.
 *
 * Some of the work to parse markdown can be done streaming, but in the
 * end buffering is required.
 *
 * micromark does not handle errors for you, so you must handle errors on whatever
 * streams you pipe into it.
 * As markdown does not know errors, `micromark` itself does not emit errors.
 *
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {MinimalDuplex}
 *   Duplex stream.
 */
export function stream(options) {
  const prep = preprocess()
  const tokenize = parse(options).document().write
  const comp = compile(options)
  /** @type {boolean} */
  let ended

  /** @type {MinimalDuplex} */
  // @ts-expect-error `addListener` is fine.
  const emitter = Object.assign(new EventEmitter(), {
    end,
    pipe,
    readable: true,
    writable: true,
    write
  })
  return emitter

  /**
   * Write a chunk into memory.
   *
   * @overload
   * @param {Value | null | undefined} [chunk]
   *   Slice of markdown to parse (`string` or `Uint8Array`).
   * @param {Encoding | null | undefined} [encoding]
   *   Character encoding to understand `chunk` as when it’s a `Uint8Array`
   *   (`string`, default: `'utf8'`).
   * @param {Callback | null | undefined} [callback]
   *   Function called when write was successful.
   * @returns {boolean}
   *   Whether write was successful.
   *
   * @overload
   * @param {Value | null | undefined} [chunk]
   *   Slice of markdown to parse (`string` or `Uint8Array`).
   * @param {Callback | null | undefined} [callback]
   *   Function called when write was successful.
   * @returns {boolean}
   *   Whether write was successful.
   *
   * @param {Value | null | undefined} [chunk]
   *   Slice of markdown to parse (`string` or `Uint8Array`).
   * @param {Callback | Encoding | null | undefined} [encoding]
   *   Character encoding to understand `chunk` as when it’s a `Uint8Array`
   *   (`string`, default: `'utf8'`).
   * @param {Callback | null | undefined} [callback]
   *   Function called when write was successful.
   * @returns {boolean}
   *   Whether write was successful.
   */
  function write(chunk, encoding, callback) {
    if (typeof encoding === 'function') {
      callback = encoding
      encoding = undefined
    }
    if (ended) {
      throw new Error('Did not expect `write` after `end`')
    }
    tokenize(prep(chunk || '', encoding))
    if (callback) {
      callback()
    }

    // Signal successful write.
    return true
  }

  /**
   * End the writing.
   *
   * Passes all arguments as a final `write`.
   *
   * @overload
   * @param {Value | null | undefined} [chunk]
   *   Slice of markdown to parse (`string` or `Uint8Array`).
   * @param {Encoding | null | undefined} [encoding]
   *   Character encoding to understand `chunk` as when it’s a `Uint8Array`
   *   (`string`, default: `'utf8'`).
   * @param {Callback | null | undefined} [callback]
   *   Function called when write was successful.
   * @returns {boolean}
   *   Whether write was successful.
   *
   * @overload
   * @param {Value | null | undefined} [chunk]
   *   Slice of markdown to parse (`string` or `Uint8Array`).
   * @param {Callback | null | undefined} [callback]
   *   Function called when write was successful.
   * @returns {boolean}
   *   Whether write was successful.
   *
   * @overload
   * @param {Callback | null | undefined} [callback]
   *   Function called when write was successful.
   * @returns {boolean}
   *
   * @param {Callback | Value | null | undefined} [chunk]
   *   Slice of markdown to parse (`string` or `Uint8Array`).
   * @param {Callback | Encoding | null | undefined} [encoding]
   *   Character encoding to understand `chunk` as when it’s a `Uint8Array`
   *   (`string`, default: `'utf8'`).
   * @param {Callback | null | undefined} [callback]
   *   Function called when write was successful.
   * @returns {boolean}
   *   Whether write was successful.
   */
  function end(chunk, encoding, callback) {
    if (typeof chunk === 'function') {
      encoding = chunk
      chunk = undefined
    }
    if (typeof encoding === 'function') {
      callback = encoding
      encoding = undefined
    }
    write(chunk, encoding, callback)
    emitter.emit('data', comp(postprocess(tokenize(prep('', encoding, true)))))
    emitter.emit('end')
    ended = true
    return true
  }

  /**
   * Pipe the processor into a writable stream.
   *
   * Basically `Stream#pipe`, but inlined and simplified to keep the bundled
   * size down.
   * See: <https://github.com/nodejs/node/blob/43a5170/lib/internal/streams/legacy.js#L13>.
   *
   * @template {NodeJS.WritableStream} Stream
   * @param {Stream} dest
   * @param {PipeOptions | null | undefined} [options]
   * @returns {Stream}
   */
  function pipe(dest, options) {
    emitter.on('data', ondata)
    emitter.on('error', onerror)
    emitter.on('end', cleanup)
    emitter.on('close', cleanup)

    // If the `end` option is not supplied, `dest.end()` will be
    // called when the `end` or `close` events are received.
    // @ts-expect-error `_isStdio` is available on `std{err,out}`
    if (!dest._isStdio && (!options || options.end !== false)) {
      emitter.on('end', onend)
    }
    dest.on('error', onerror)
    dest.on('close', cleanup)
    dest.emit('pipe', emitter)
    return dest

    /**
     * End destination stream.
     *
     * @returns {undefined}
     */
    function onend() {
      if (dest.end) {
        dest.end()
      }
    }

    /**
     * Handle data.
     *
     * @param {string} chunk
     * @returns {undefined}
     */
    function ondata(chunk) {
      if (dest.writable) {
        dest.write(chunk)
      }
    }

    /**
     * Clean listeners.
     *
     * @returns {undefined}
     */
    function cleanup() {
      emitter.removeListener('data', ondata)
      emitter.removeListener('end', onend)
      emitter.removeListener('error', onerror)
      emitter.removeListener('end', cleanup)
      emitter.removeListener('close', cleanup)
      dest.removeListener('error', onerror)
      dest.removeListener('close', cleanup)
    }

    /**
     * Close dangling pipes and handle unheard errors.
     *
     * @param {Error | null | undefined} [error]
     * @returns {undefined}
     */
    function onerror(error) {
      cleanup()
      if (!emitter.listenerCount('error')) {
        throw error // Unhandled stream error in pipe.
      }
    }
  }
}
