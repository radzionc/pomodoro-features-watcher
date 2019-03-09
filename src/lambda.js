const { processRecord } = require('./watcher')

exports.handler = async ({ Records }, context, callback) => {
  await Promise.all(Records.map(processRecord))
  callback(null, `Successfully processed ${Records.length} records.`)
}
