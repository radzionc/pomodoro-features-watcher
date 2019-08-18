const AWS = require('aws-sdk')

const { TABLE_NAME } = require('../src/constants')

const documentClient = new AWS.DynamoDB.DocumentClient()

const paginationAware = method => async params => {
  const getItems = async (items, lastEvaluatedKey, firstTime = false) => {
    if (!lastEvaluatedKey) return items

    const { Items, LastEvaluatedKey } = await documentClient[method](
      firstTime ? params : { ...params, ExclusiveStartKey: lastEvaluatedKey }
    ).promise()
    return await getItems([...items, ...Items], LastEvaluatedKey)
  }
  return getItems([], true, true)
}

const scan = paginationAware('scan')

const visitedUsers = async () => {
  const users = await scan({
    TableName: TABLE_NAME.USERS,
    ProjectionExpression: 'email, id',
    FilterExpression: "#sets <> :empty",
    ExpressionAttributeNames: {
      '#sets': 'sets'
    },
    ExpressionAttributeValues : {
      ':empty': [],
    },
  })
  console.log(`User, that made one or more sets this week: ${users.length}`)
}

visitedUsers()
