const prefix = 'pomodoro_'

const TABLE_NAME = {
  USERS: `${prefix}users`,
  FEATURES: `${prefix}features`
}

const FEATURE_STATUS = {
  WAITING_FOR_CONFIRMATION: 'WAITING_FOR_CONFIRMATION',
  IN_QUEUE: 'IN_QUEUE',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE'
}

module.exports = {
  TABLE_NAME,
  FEATURE_STATUS
}