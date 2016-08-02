'use strict'

const chalk = require('chalk')

module.exports = (opts) => {
  opts = opts || {}
  const withColors = opts.colors !== false

  var formatters = {

    event (msg) {
      let event = msg.body.event || {}
      let msgType = event.type + (event.subtype ? `.${event.subtype}` : '')
      let text = event.text || event.reaction || ''
      let channelId = event.channel || (event.item && event.item.channel)

      let output = [
        `${type(msg.type)}`,
        `${team(msg.body.team_id)}`,
        `${channel(channelId)}`,
        event.bot_id ? `${bot(event.bot_id)}` : `${user(event.user)}`,
        `${c(msgType, 'yellow')}`,
        `${text}`
      ].join(' ')

      if ((event.attachments || []).length > 0) {
        output += `${event.attachments.length} attachments`
      }

      return output
    },

    action (msg) {
      let actions = (msg.body.actions || []).map(action => {
        return `${action.name}=${action.value}`
      })
      let teamId = msg.body.team && msg.body.team.id || 'UNKNOWN'
      let channelId = msg.body.channel && msg.body.channel.id || 'UNKNOWN'
      let userId = msg.body.user && msg.body.user.id || 'UNKNOWN'

      return [
        `${type(msg.type)}`,
        `${team(teamId)}`,
        `${channel(channelId)}`,
        `${user(userId)}`,
        `${actions.join(',')}`
      ].join(' ')
    },

    command (msg) {
      return [
        `${type(msg.type)}`,
        `${team(msg.body.team_id)}`,
        `${channel(msg.body.channel_id)}`,
        `${user(msg.body.user_id)}`,
        `${msg.body.command}`,
        `${msg.body.text}`
      ].join(' ')
    }

  }

  function c (val, color) {
    return withColors ? chalk[color](val) : val
  }

  function type (val) {
    val = {
      'action': 'act',
      'event': 'evt',
      'command': 'cmd'
    }[val] || val

    return c(`[${val}]`, 'gray')
  }

  function team (val) {
    return c(`tm=${val}`, 'red')
  }

  function channel (val) {
    return c(`ch=${val}`, 'magenta')
  }

  function user (val) {
    return c(`usr=${val}`, 'cyan')
  }

  function bot (val) {
    return c(`bot=${val}`, 'cyan')
  }

  return function formatMessage (msg) {
    if (!msg) {
      return null
    }
    if (!formatters[msg.type]) {
      return `Unknown type: ${type(msg.type)}`
    }

    return formatters[msg.type](msg)
  }
}
