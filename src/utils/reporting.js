const Sentry = require('@sentry/node')

const { getReportError } = require('increaser-utils')

function reportError(...args) {
  if (!this.report) {
    Sentry.init({ dsn: process.env.SENTRY_KEY })
    this.report = getReportError(Sentry, [], 2000)
  }

  return this.report(...args)
}

module.exports = {
  reportError
}