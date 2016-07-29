'use strict'
const dox = require('dox')
const fs = require('fs')
const path = require('path')

const readmePath = path.join(__dirname, '/../README.md')

// read source
const src = [
  {
    name: 'slapp',
    src: fs.readFileSync(path.join(__dirname, '/../src/index.js'), { encoding: 'utf8' })
  },
  {
    name: 'Slapp',
    src: fs.readFileSync(path.join(__dirname, '/../src/slapp.js'), { encoding: 'utf8' })
  },
  {
    name: 'Message',
    description: `
A Message object is created for every incoming Slack event, slash command, and interactive message action.
It is generally always passed as \`msg\`.

\`msg\` has three main top level properties
- \`type\` - one of \`event\`, \`command\`, \`action\`
- \`body\` - the unmodified payload of the original event
- \`meta\` - derived or normalized properties and anything appended by middleware.

\`meta\` should at least have these properties
- \`app_token\` - token for the user for the app
- \`app_user_id\` - userID for the user who install ed the app
- \`bot_token\` - token for a bot user of the app
- \`bot_user_id\` -  userID of the bot user of the app
    `,
    src: fs.readFileSync(path.join(__dirname, '/../src/message.js'), { encoding: 'utf8' })
  }
]

let apiLines = []

src.forEach((item) => {
  const comments = dox.parseComments(item.src, { raw: true })
  apiLines.push('# ' + item.name)
  if (item.description) apiLines.push(item.description)
  apiLines.push(formatDoxComments(comments))
})

let api = apiLines.join('\n\n')
let readme = fs.readFileSync(readmePath, { encoding: 'utf8' })
let parts = readme.split('# API\n')
let preamble = parts[0]
parts = parts[1].split('# Contributing\n')
let postamble = parts[1]

let updatedReadme = [preamble, '# API\n\n', api, '\n\n# Contributing\n', postamble].join('')
fs.writeFileSync(readmePath, updatedReadme)

/**
 * Adapted from dox source
 */

function formatDoxComments (comments) {
  var buf = []

  comments.forEach((comment) => {
    if (comment.isPrivate) return
    if (comment.ignore) return
    var ctx = comment.ctx
    var desc = comment.description
    if (!ctx) return
    if (~desc.full.indexOf('Module dependencies')) return
    if (!ctx.string.indexOf('module.exports')) return
    buf.push('### ' + context(comment))
    buf.push('')
    buf.push(desc.full.trim().replace(/^/gm, '  '))
    buf.push('')
  })

  buf = buf
    .join('\n')
    .replace(/^ *#/gm, '')

  var code = buf.match(/^( {4}[^\n]+\n*)+/gm) || []

  code.forEach((block) => {
    var code = block.replace(/^ {4}/gm, '')
    buf = buf.replace(block, '```js\n' + code.trimRight() + '\n```\n\n')
  })

  return toc(buf) + '\n\n' + buf
}

function toc (str) {
  return headings(str).filter((h) => { return h.level <= 2 }).map((h) => {
    var clean = h.title.replace(/\(.*?\)/, '()')
    return '  - [' + clean + '](#' + slug(h.title) + ')'
  }).join('\n')
}

function slug (str) {
  return str.replace(/\W+/g, '').toLowerCase()
}

function headings (str) {
  return (str.match(/^#+ *([^\n]+)/gm) || []).map((str) => {
    str = str.replace(/^(#+) */, '')
    return {
      title: str,
      level: RegExp.$1.length
    }
  })
}

function context (comment) {
  var ctx = comment.ctx
  var tags = comment.tags

  var alias = tags.map((tag) => {
    return tag.type === 'alias' && tag.string
  }).filter(Boolean)

  let name

  switch (ctx.type) {
    case 'function':
      name = alias.pop() || ctx.name
      return name + '(' + params(tags) + ')'
    case 'method':
    case 'constructor':
      name = alias.pop() || (ctx.cons || ctx.receiver) + '.' + ctx.name
      return name + '(' + params(tags) + ')'
    default:
      return alias.pop() || ctx.string
  }
}

function params (tags) {
  return tags.filter((tag) => {
    return tag.type === 'param'
  }).map((param) => {
    return param.name + ':' + param.types.join('|')
  }).join(', ')
}
