const { getModule } = require('awsdynamoutils')

const { TABLE_NAME } = require('../constants')

const { getByPK } = getModule({})


const defaultParams = id => ({
  TableName: TABLE_NAME.USERS,
  Key: { id }
})

const get = (id, attributes = undefined) =>
  getByPK(defaultParams(id), attributes)

module.exports = {
  get,
}