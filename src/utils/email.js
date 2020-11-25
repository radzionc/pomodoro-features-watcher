const aws = require('aws-sdk')
const fs = require('fs')
const { getFirstName } = require('increaser-utils')
const path = require('path')

const SOURCE = `Rodion Chachura <${process.env.SENDER_EMAIL_ADDRESS}>`
const FEATURE_TEMPLATE = '../templates/feature.html'

function getSES() {
  if (!this.ses) {
    this.ses = new aws.SES({ region: process.env.AWS_REGION_SES })
  }
  return this.ses
}

const sendEmail = (email, body, subject) =>
  getSES()
    .sendEmail({
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Body: {
          Html: {
            Data: body
          }
        },
        Subject: {
          Data: subject
        }
      },
      Source: SOURCE
    })
    .promise()

const getLink = (text, href) => `<a target="_blank" href="${href}">${text}</a>`

const sendFeatureRelatedEmail = async (email, name, content, subject) => {
  const defaultHTML = await fs.promises.readFile(path.resolve(__dirname, FEATURE_TEMPLATE), 'utf8')
  const readyHTML = defaultHTML
    .replace('{{name}}', getFirstName(name))
    .replace('{{content}}', content)
  console.log(`sending email from ${process.env.SENDER_EMAIL_ADDRESS} to ${email}`)
  return sendEmail(email, readyHTML, subject)
}

const featureMovedIntoProgress = (email, name, featureName) => sendFeatureRelatedEmail(
  email,
  name,
  `Thanks for suggesting the feature. It is now ${getLink('on the list', process.env.APP_FEATURES_URL)} with the name "${featureName}."`,
  'Upvote Your Feature',
)

const featureDone = (email, name, featureName) => sendFeatureRelatedEmail(
  email,
  name,
  `We finally added Your feature "${featureName}" to ${getLink('Increaser', process.env.APP_URL)}. What do you think about it?`,
  'Your Feature is Alive'
)

module.exports = {
  featureMovedIntoProgress,
  featureDone,
}