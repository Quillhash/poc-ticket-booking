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

  const bookEvent = (req, res) => {
    const userId = req.body.userId
    const eventCode = req.body.eventCode
    return stellar.bookEvent(userId, eventCode)
      .then(response => res.status(200).send(response))
      .catch(err => res.status(400).send(err.message))
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
    return stellar.cancelBooking(userId, eventCode)
      .then(response => res.status(200).send(response))
      .catch(err => res.status(400).send(err.message))
  }

  const useTicketByUserId = (req, res) => {
    const userId = req.body.userId
    const eventCode = req.body.eventCode
    return stellar.useTicket(userId, eventCode)
      .then(response => res.status(200).send(response))
      .catch(err => res.status(400).send(err.message))
  }

  const useTicketByTransaction = (req, res) => {
    const txId = req.params.tx
    if (!txId) {
      res.status(400).send('INVALID_REQUEST')
      return
    }
    return stellar.useTicketByTransaction(txId)
      .then(response => res.status(200).send(response))
      .catch(err => res.status(400).send(err.message))
  }

  router.use('/event/list', getAllEvents)
  router.post('/event/book', bookEvent)
  router.post('/event/cancel', cancelBooking)
  router.post('/event/booked', getBookedEvents)
  router.post('/event/useticket', useTicketByUserId)
  router.get('/event/useticket/:tx', useTicketByTransaction)

  return router
}

