const AWS = require('aws-sdk')

const { FEATURE_STATUS } = require('./constants')
const notify = require('./utils/notify')

module.exports = {
  processRecord: async ({ dynamodb: { Keys, NewImage, OldImage } }) => {
    // const keys = AWS.DynamoDB.Converter.unmarshall(Keys)
    const [before, after] = [OldImage, NewImage]
      .map(item => (item ? AWS.DynamoDB.Converter.unmarshall(item) : undefined))
      
    if (!before && after.status === FEATURE_STATUS.WAITING_FOR_CONFIRMATION)
    {
      await notify.newFeatureSubmit(after)
    }
  }
}
