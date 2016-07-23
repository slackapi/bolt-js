const dox = require('dox')
const fs = require('fs')

// read source
const src = [
  {
    name: 'SlackApp',
    src: fs.readFileSync(__dirname + '/../src/slackapp.js', { encoding: 'utf8' })
  },
  {
    name: 'Message',
    src: fs.readFileSync(__dirname + '/../src/message.js', { encoding: 'utf8' })
  }
]

let apiLines = []

src.forEach((item) => {
  const comments = dox.parseComments(item.src)

  apiLines.push('## ' + src.name)
  comments.forEach((i) => {
    apiLines.push('### ' + item.name + '.' + i.ctx.string)
    apiLines.push(i.description.full)
  })
})

let api = apiLines.join('\n\n')
let readme = fs.readFileSync(__dirname + '/../README.md', { encoding: 'utf8' })
let parts = readme.split('# API\n')
let preamble = parts[0]
parts = parts[1].split('# Contributing\n')
let postamble = parts[1]

let updatedReadme = [preamble, "# API", api, '# Contributing', postamble].join('\n\n')
fs.writeFileSync(__dirname + '/../README.md', updatedReadme)
