const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')

const { TABLE_NAME } = require('../src/constants')
const { sendEmail } = require('../src/utils/email')

const documentClient = new AWS.DynamoDB.DocumentClient()

const template = 'subscription'
const subject = 'Membership'

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
  const html = fs.readFileSync(path.resolve(__dirname, `../templates/${template}.html`), 'utf8')
  let emails = users.map(u => u.email)
  while(emails.length > 0) {
    const emailsToSend = emails.slice(0, 14)
    console.log(`Emails to send: ${emails.length}`)
    emails = emails.slice(14)
    await Promise.all(emailsToSend.map(email => sendEmail(email, html, subject)))
    await new Promise(r => setTimeout(r, 1000))
  }
}

sendEmails()
