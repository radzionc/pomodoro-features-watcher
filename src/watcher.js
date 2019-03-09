const AWS = require('aws-sdk')


module.exports = {
  processRecord: async ({ dynamodb: { Keys, NewImage, OldImage } }) => {
    const keys = AWS.DynamoDB.Converter.unmarshall(Keys)
    const [before, after] = [OldImage, NewImage]
      .map(item => (item ? AWS.DynamoDB.Converter.unmarshall(item) : undefined))
      
    console.log(keys, before, after)
  }
}
