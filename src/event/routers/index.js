const routers = (stellarEngine, qrGenerator) => {
  const router = require('express').Router()

  // const attendeeController = require('./attendeeController')(stellarEngine)
  // const organizerController = require('./organizerController')(stellarEngine)
  const ticketingController = require('./ticketingController')(stellarEngine, qrGenerator)

  // router.use('/attendee', attendeeController)
  // router.use('/organizer', organizerController)
  router.use('/', ticketingController)
  // router.use('/', (req, res) => {
  //   res.status(200).send('OK')
  // })

  return router
}

module.exports = routers
