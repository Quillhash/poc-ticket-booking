/*
  - create event
  - list all events
  - list events of creator
  - delete event
*/

module.exports = (stellar) => {
  const router = require('express').Router()

  const createEvent = (req, res) => {
    const event = req.body
    return stellar.createEvent(event)
      .then(event => {
        const response = {
          event,
        }
        res.status(200).send(response)
      })
      .catch(err => {
        res.send(err, 501)
      })
  }

  const getAllEvents = (req, res) => {
    stellar.getAllEvents().then(events => {
      const response = {
        events,
      }
      res.status(200).send(response)
    })
  }

  // TODO: implement cancel event
  // const cancelEvent = (req, res) => {
  //   const result = stellar.cancelEvent()

  //   const response = {
  //     result,
  //   }
  //   res.status(200).send(response)
  // }

  router.use('/event/list', getAllEvents)
  router.post('/event/create', createEvent)
  // router.post('/event/cancel', cancelEvent)

  return router
}

