module.exports = (config) => new Promise((resolve, reject) => {
  const express = require('express')
  const bodyParser = require('body-parser')
  const responseTime = require('response-time')

  const app = express()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.use(responseTime())
  app.listen(config.port, (err) => {
    if (err) {
      reject(err)
    } else {
      console.log("app running on port.", config.port);
      resolve(app)
    }
  })
})
