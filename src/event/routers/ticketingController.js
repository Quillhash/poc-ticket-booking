/*
  - list all events
  - book event: event id
  - list booked event
  - cancel ticket
*/

module.exports = (stellar, qrGenerator) => {
  const microtime = require('microtime')
  const { fbTemplate } = require('claudia-bot-builder')
  const router = require('express').Router()

  const toFbList = (events) => {
    const generic = new fbTemplate.Generic()

    events.forEach(event => {
      generic.addBubble(event.title, event.subtitle)
        .addImage(event.coverImage)
        .addDefaultAction(event.url)
        .addButton('See more detail', event.url)
        .addButton(`Join ${event.title}`, `Join ${event.title}`)
    })

    return generic.get()
  }

  const toBookResponse = (bookingInfo) => {
    // NC:TODO: Generate QR Code and store in firebase
    const imgUrl = bookingInfo.imgUrl
    const ret = new fbTemplate.Image(imgUrl).get()
    ret.tx = bookingInfo.tx
    return ret
  }

  const getAllEvents = (req, res) => {
    return stellar.getAllEvents().then(events => {
      const response = toFbList(events)
      res.status(200).send(response)
    })
  }

  const bookEvent = async (req, res) => {
    const userId = `${microtime.now()}`
    const title = req.body.parameters['event-title']
    let eventCode

    if (title) {
      const event = await stellar.getAllEvents().then(events => events.find(e => e.title === title))
      eventCode = event ? event.code : ''
    }

    if (eventCode) {
      return stellar.bookEvent(userId, eventCode)
        .then(response => {
          return qrGenerator(response.tx, response.tx).then(url => (response.imgUrl = url, response))
        })
        .then(response => res.status(200).send(toBookResponse(response)))
        .catch(err => res.status(400).send(err.message))
    }

    return res.status(400).send('EVENT_NOTFOUND')
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

  const confirmTicketByTransaction = (req, res) => {
    // NC:TODO: send confirmation email for using ticket
    const txId = req.params.tx
    if (!txId) {
      res.status(400).send('INVALID_REQUEST')
      return
    }
    return stellar.confirmTicketByTransaction(txId)
      .then(response => res.status(200).send(response))
      .catch(err => res.status(400).send(err.message))
  }

  const actionMapper = {
    ['list.events']: getAllEvents,
    ['events.tickets.book-yes']: bookEvent
  }

  const eventHandler = (req, res) => {
    const handler = actionMapper[req.body.action]

    if (handler) {
      return handler(req, res)
    }

    return res.status(400).send('INVALID_REQUEST')
  }

  router.post('/', eventHandler)
  router.get('/confirm/:tx', confirmTicketByTransaction)
  router.get('/useticket/:tx', useTicketByTransaction)

  return router
}

