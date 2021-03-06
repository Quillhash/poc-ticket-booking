require('dotenv/config')

const config = require('./config')
const server = require('./server')

server(config).start()
  .catch(console.error)
