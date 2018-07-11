const routers = (stellarEngine) => {
  const router = require('express').Router()

  const attendeeController = require('./attendeeController')(stellarEngine)
  const organizerController = require('./organizerController')(stellarEngine)

  router.use('/attendee', attendeeController)
  router.use('/organizer', organizerController)
  router.use('/', (req, res) => {
    res.status(200).send('OK')
  })

  return router
}

module.exports = routers
