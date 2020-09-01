const TelegramBot = require('node-telegram-bot-api')

const usersTable = require('../db/users')
const { reportError } = require('./reporting')

module.exports = {
  newFeatureSubmit: async ({ name, description, ownerId }) => {
    try {
      const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN)
      const chatId = process.env.TELEGRAM_BOT_CHAT_ID
      const user = await usersTable.get(ownerId, ['name', 'email'])
      await bot.sendMessage(
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
      await reportError('Fail to notify via telegram about new feature submit.', { name, description, ownerId }, err)
    }
  }
}
