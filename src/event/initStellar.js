module.exports = (config) => {
  const stellarEngine = require('../stellar')(config)
  return require('./stellar')(stellarEngine)
}