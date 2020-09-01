const Sentry = require('@sentry/node')

const { getReportError } = require('increaser-utils')

module.exports = {
  reportError: getReportError(Sentry, [], 2000)
}