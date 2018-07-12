module.exports = (config) => new Promise((resolve, reject) => {
  const express = require('express')
  const bodyParser = require('body-parser')
  const responseTime = require('response-time')
  const cors = require('cors')

  const app = express()

  // setup middlewares
  app.use(cors())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(responseTime())

  app.listen(config.port, (err) => {
    if (err) {
      reject(err)
    } else {
      console.log('app running on port.', config.port)
      resolve(app)
    }
  })
})
