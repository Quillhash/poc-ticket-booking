/*
  - list all events
  - book event: event id
  - list booked event
  - cancel ticket
*/

module.exports = (stellar) => {
  const router = require('express').Router()

  const getAllEvents = (req, res) => {
    stellar.getAllEvents().then(events => {
      const response = {
        events,
      }
      res.status(200).send(response)
    })
  }

  const bookEvent = (req, res) =>
  {
    const userId = req.body.userId
    const eventCode = req.body.eventCode
    return stellar.bookEvent(userId, eventCode)
      .then(result => !result ? 0 : stellar.getBookedCount(userId, eventCode))
      .then(count => {
        const response = {
          count
        }
        res.status(200).send(response)
      })
  }

  const getBookedEvents = (req, res) => {
    const userId = req.body.userId
    return stellar.getBookedEvents(userId).then(events => {
      const response = {
        events
      }
      res.status(200).send(response)
    })
  }

  const cancelBooking = (req, res) => {
    const userId = req.body.userId
    const eventCode = req.body.eventCode
    return stellar.cancelBooking(userId, eventCode).then(remaining => {
      const response = {
        remaining
      }
      res.status(200).send(response)
    })
  }

  const useTicket = (req, res) => {
    const userId = req.body.userId
    const eventCode = req.body.eventCode
    return stellar.useTicket(userId, eventCode).then(remaining => {
      const response = {
        remaining
      }
      res.status(200).send(response)
    })
  }

  router.use('/event/list', getAllEvents)
  router.post('/event/book', bookEvent)
  router.post('/event/cancel', cancelBooking)
  router.post('/event/booked', getBookedEvents)
  router.post('/event/useticket', useTicket)

  return router
}

