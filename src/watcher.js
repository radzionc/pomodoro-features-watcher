const AWS = require('aws-sdk')
const Sentry = require('@sentry/node')

const { FEATURE_STATUS } = require('./constants')
const notify = require('./utils/notify')
const emailUtils = require('./utils/email')
const usersTable = require('../db/users')

module.exports = {
  processRecord: async ({ dynamodb: { Keys, NewImage, OldImage } }) => {
    try {
      const [before, after] = [OldImage, NewImage]
        .map(item => (item ? AWS.DynamoDB.Converter.unmarshall(item) : undefined))
        
      if (!before && after.status === FEATURE_STATUS.WAITING_FOR_CONFIRMATION)
      {
        await notify.newFeatureSubmit(after)
      }
      if (before && after) {
        const { email } = await usersTable.get(after.ownerId, ['email'])
        if (before.status === FEATURE_STATUS.WAITING_FOR_CONFIRMATION && after.status === FEATURE_STATUS.IN_QUEUE) {
          await emailUtils.featureMovedIntoProgress(email, after.name)
        } else if (before.status === FEATURE_STATUS.IN_QUEUE && after.status === FEATURE_STATUS.DONE) {
          await emailUtils.featureDone(email, after.name)
        }
      }
    } catch (err) {
      Sentry.configureScope(scope => {
        Object.entries(error).map(([key, value]) => scope.setExtra(key, value))
      })
      Sentry.captureException(
        'Watcher Fail'
      )
    }
  }
}
