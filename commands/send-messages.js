const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')

const { TABLE_NAME } = require('../src/constants')
const { sendEmail } = require('../src/utils/email')

const documentClient = new AWS.DynamoDB.DocumentClient()

const template = 'weekly'
const subject = '"Pomodoro by Increaser" News'

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
  let users = await scan({
    TableName: TABLE_NAME.USERS,
    ProjectionExpression: 'email, id',
    FilterExpression: "ignorePomodoroNews <> :true",
    ExpressionAttributeValues : {
      ':true': true,
    }
  })
  // let users = [{ email: 'geekrodion@gmail.com', id: 'a25f64679413841eabf1fe070e27abee8' }]
  const html = fs.readFileSync(path.resolve(__dirname, `../templates/${template}.html`), 'utf8')
  while(users.length > 0) {
    const emailsToSend = users.slice(0, 14)
    console.log(`Emails to send: ${users.length}`)
    users = users.slice(14)
    await Promise.all(emailsToSend.map(({ email, id }) => sendEmail(email, html.replace('{{id}}', id), subject)))
    await new Promise(r => setTimeout(r, 1000))
  }
}

sendEmails()
