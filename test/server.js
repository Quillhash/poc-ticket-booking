require('dotenv/config')
const config = require('../src/event/config')

module.exports = () => {
  const server = require('../src/event/server')(config)

  return {
    start: () => {
      return server.start()
    },
    stop: () => {
      return server.stop()
    },
    getConfig: () => {
      return config
    }
  }
}