const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')

const { TABLE_NAME } = require('../src/constants')
const { sendEmail } = require('../src/utils/email')

const documentClient = new AWS.DynamoDB.DocumentClient()

const template = 'features'
const subject = 'Make an Impact!'

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

const sendEmails = async () => {
  const users = await scan({
    TableName: TABLE_NAME.USERS,
    ProjectionExpression: 'email',
  })
  const emails = users.map(u => u.email)
  const html = fs.readFileSync(path.resolve(__dirname, `../templates/${template}.html`), 'utf8')
  await Promise.all(emails.map(email => sendEmail(email, html, subject)))
}

sendEmails()
