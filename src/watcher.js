const AWS = require('aws-sdk')
const Sentry = require('@sentry/node')

const { FEATURE_STATUS } = require('./constants')
const notify = require('./utils/notify')
const emailUtils = require('./utils/email')
const usersTable = require('./db/users')
const { reportError } = require('./utils/reporting')

Sentry.init({ dsn: process.env.SENTRY_KEY })

module.exports = {
  processRecord: async ({ dynamodb: { NewImage, OldImage } }) => {
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
        } else if ([FEATURE_STATUS.WAITING_FOR_CONFIRMATION, FEATURE_STATUS.IN_QUEUE, FEATURE_STATUS.IN_PROGRESS].includes(before.status) && after.status === FEATURE_STATUS.DONE) {
          await emailUtils.featureDone(email, after.name)
        }
      }
    } catch (err) {
      await reportError('Fail to process record', { NewImage, OldImage }, err)
    }
  }
}
