const TelegramBot = require('node-telegram-bot-api')
const Sentry = require('@sentry/node')

const usersTable = require('../db/users')

module.exports = {
  newFeatureSubmit: async ({ name, description, ownerId }) => {
    try {
      const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN)
      const chatId = process.env.TELEGRAM_BOT_CHAT_ID
      const user = await usersTable.get(ownerId, ['name', 'email'])
      bot.sendMessage(
        chatId,
        `
        Hey GR! This is from pomodoro-features-watcher.
        The user with name ${user.name} and email ${
          user.email
        } proposed a new feature.
        Name of the feature is "${name}". ${
          description ? `Description: ${description}` : ''
        }
      `
      )
    } catch (err) {
      Sentry.configureScope(scope => {
        Object.entries(error).map(([key, value]) => scope.setExtra(key, value))
      })
      Sentry.captureException(
        'Fail to notify via telegram about new feature submit.'
      )
    }
  }
}
