require('dotenv/config')

const server = require('./server')

server.start()
  .catch(console.error)
