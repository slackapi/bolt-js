/**
 * @typedef {import('estree').Property} Property
 *
 * @typedef {import('estree-jsx').JSXAttribute} JsxAttribute
 * @typedef {import('estree-jsx').JSXElement} JsxElement
 * @typedef {import('estree-jsx').JSXSpreadAttribute} JsxSpreadAttribute
 *
 * @typedef {import('hast').Element} HastElement
 *
 * @typedef {import('../state.js').State} State
 */

/**
 * @typedef {Record<string, string>} Style
 */

import {stringify as commas} from 'comma-separated-tokens'
import {name as identifierName} from 'estree-util-is-identifier-name'
import {find, hastToReact, svg} from 'property-information'
import {stringify as spaces} from 'space-separated-tokens'
import styleToObject from 'style-to-object'

const own = {}.hasOwnProperty
const cap = /[A-Z]/g
const dashSomething = /-([a-z])/g

const tableCellElement = new Set(['td', 'th'])

/**
 * Turn a hast element into an estree node.
 *
 * @param {HastElement} node
 *   hast node to transform.
 * @param {State} state
 *   Info passed around about the current state.
 * @returns {JsxElement}
 *   estree expression.
 */
// eslint-disable-next-line complexity
export function element(node, state) {
  const parentSchema = state.schema
  let schema = parentSchema
  const props = node.properties || {}

  if (parentSchema.space === 'html' && node.tagName.toLowerCase() === 'svg') {
    schema = svg
    state.schema = schema
  }

  const children = state.all(node)

  /** @type {Array<JsxAttribute | JsxSpreadAttribute>} */
  const attributes = []
  /** @type {string} */
  let prop
  /** @type {string | undefined} */
  let alignValue
  /** @type {Array<Property> | undefined} */
  let styleProperties

  for (prop in props) {
    if (own.call(props, prop)) {
      let value = props[prop]
      const info = find(schema, prop)
      /** @type {JsxAttribute['value']} */
      let attributeValue

      // Ignore nullish and `NaN` values.
      // Ignore `false` and falsey known booleans.
      if (
        value === null ||
        value === undefined ||
        value === false ||
        (typeof value === 'number' && Number.isNaN(value)) ||
        (!value && info.boolean)
      ) {
        continue
      }

      prop =
        state.elementAttributeNameCase === 'react' && info.space
          ? hastToReact[info.property] || info.property
          : info.attribute

      if (Array.isArray(value)) {
        // Accept `array`.
        // Most props are space-separated.
        value = info.commaSeparated ? commas(value) : spaces(value)
      }

      if (prop === 'style') {
        let styleObject =
          typeof value === 'object'
            ? value
            : parseStyle(String(value), node.tagName)

        if (state.stylePropertyNameCase === 'css') {
          styleObject = transformStylesToCssCasing(styleObject)
        }

        /** @type {Array<Property>} */
        const cssProperties = []
        /** @type {string} */
        let cssProp

        for (cssProp in styleObject) {
          // eslint-disable-next-line max-depth
          if (own.call(styleObject, cssProp)) {
            cssProperties.push({
              type: 'Property',
              method: false,
              shorthand: false,
              computed: false,
              key: identifierName(cssProp)
                ? {type: 'Identifier', name: cssProp}
                : {type: 'Literal', value: cssProp},
              value: {type: 'Literal', value: String(styleObject[cssProp])},
              kind: 'init'
            })
          }
        }

        styleProperties = cssProperties
        attributeValue = {
          type: 'JSXExpressionContainer',
          expression: {type: 'ObjectExpression', properties: cssProperties}
        }
      } else if (value === true) {
        attributeValue = null
      } else if (
        state.tableCellAlignToStyle &&
        tableCellElement.has(node.tagName) &&
        prop === 'align'
      ) {
        alignValue = String(value)
        continue
      } else {
        attributeValue = {type: 'Literal', value: String(value)}
      }

      if (identifierName(prop, {jsx: true})) {
        attributes.push({
          type: 'JSXAttribute',
          name: {type: 'JSXIdentifier', name: prop},
          value: attributeValue
        })
      } else {
        attributes.push({
          type: 'JSXSpreadAttribute',
          argument: {
            type: 'ObjectExpression',
            properties: [
              {
                type: 'Property',
                method: false,
                shorthand: false,
                computed: false,
                key: {type: 'Literal', value: String(prop)},
                // @ts-expect-error No need to worry about `style` (which has a
                // `JSXExpressionContainer` value) because that’s a valid identifier.
                value: attributeValue || {type: 'Literal', value: true},
                kind: 'init'
              }
            ]
          }
        })
      }
    }
  }

  if (alignValue !== undefined) {
    if (!styleProperties) {
      styleProperties = []
      attributes.push({
        type: 'JSXAttribute',
        name: {type: 'JSXIdentifier', name: 'style'},
        value: {
          type: 'JSXExpressionContainer',
          expression: {type: 'ObjectExpression', properties: styleProperties}
        }
      })
    }

    const cssProp =
      state.stylePropertyNameCase === 'css'
        ? transformStyleToCssCasing('textAlign')
        : 'textAlign'

    styleProperties.push({
      type: 'Property',
      method: false,
      shorthand: false,
      computed: false,
      key: identifierName(cssProp)
        ? {type: 'Identifier', name: cssProp}
        : {type: 'Literal', value: cssProp},
      value: {type: 'Literal', value: alignValue},
      kind: 'init'
    })
  }

  // Restore parent schema.
  state.schema = parentSchema

  /** @type {JsxElement} */
  const result = {
    type: 'JSXElement',
    openingElement: {
      type: 'JSXOpeningElement',
      attributes,
      name: state.createJsxElementName(node.tagName),
      selfClosing: children.length === 0
    },
    closingElement:
      children.length > 0
        ? {
            type: 'JSXClosingElement',
            name: state.createJsxElementName(node.tagName)
          }
        : null,
    children
  }
  state.inherit(node, result)
  return result
}

/**
 * Parse CSS rules as a declaration.
 *
 * @param {string} value
 *   CSS text.
 * @param {string} tagName
 *   Element name.
 * @returns {Style}
 *   Props.
 */
function parseStyle(value, tagName) {
  /** @type {Style} */
  const result = {}

  try {
    styleToObject(value, iterator)
  } catch (error) {
    const cause = /** @type {Error} */ (error)
    const exception = new Error(
      'Could not parse `style` attribute on `' + tagName + '`',
      {cause}
    )
    throw exception
  }

  return result

  /**
   * Add `name`, as a CSS prop, to `result`.
   *
   * @param {string} name
   *   Key.
   * @param {string} value
   *   Value.
   * @returns {undefined}
   *   Nothing.
   */
  function iterator(name, value) {
    let key = name

    if (key.slice(0, 2) !== '--') {
      // See: <https://alanhogan.com/code/vendor-prefixed-css-property-names-in-javascript>
      if (key.slice(0, 4) === '-ms-') key = 'ms-' + key.slice(4)
      key = key.replace(dashSomething, toCamel)
    }

    result[key] = value
  }
}

/**
 * Transform a DOM casing style object to a CSS casing style object.
 *
 * @param {Style} domCasing
 * @returns {Style}
 */
function transformStylesToCssCasing(domCasing) {
  /** @type {Style} */
  const cssCasing = {}
  /** @type {string} */
  let from

  for (from in domCasing) {
    if (own.call(domCasing, from)) {
      cssCasing[transformStyleToCssCasing(from)] = domCasing[from]
    }
  }

  return cssCasing
}

/**
 * Transform a DOM casing style prop to a CSS casing style prop.
 *
 * @param {string} from
 * @returns {string}
 */
function transformStyleToCssCasing(from) {
  let to = from.replace(cap, toDash)
  // Handle `ms-xxx` -> `-ms-xxx`.
  if (to.slice(0, 3) === 'ms-') to = '-' + to
  return to
}

/**
 * Make `$1` capitalized.
 *
 * @param {string} _
 *   Whatever.
 * @param {string} $1
 *   Single ASCII alphabetical.
 * @returns {string}
 *   Capitalized `$1`.
 */
function toCamel(_, $1) {
  return $1.toUpperCase()
}

/**
 * Make `$0` dash cased.
 *
 * @param {string} $0
 *   Capitalized ASCII leter.
 * @returns {string}
 *   Dash and lower letter.
 */
function toDash($0) {
  return '-' + $0.toLowerCase()
}
