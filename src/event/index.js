require('dotenv/config')

const config = require('./config')
const server = require('./server')

server.start(config)
  .catch(console.error)
