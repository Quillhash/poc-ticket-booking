/*
  - list all events
  - book event: event id
  - list booked event
  - cancel ticket
*/


module.exports = (router, stellar) => {
  const getAllEvents = (req, res) => {
    const events = stellar.getAllEvents()
  
    const response = {
      events,
    }
    res.status(200).send(response)
  }
  
  const bookEvent = (req, res) => 
  {
    const userId = 'userId',
    const eventId = 'eventId'
    const result = stellar.bookEvent(userId, eventId)
    const response = {
      result
    }
    res.status(200).send(response)
  }
  
  const getBookedEvents = (req, res) => {
    const events = stellar.getBookedEvents()
  
    const response = {
      events
    }
    res.status(200).send(response)
  }
  
  const cancelBooking = (req, res) => {
    const result = stellar.cancelBooking()

    const response = {
      result
    }
    res.status(200).send(response)
  }

  router.post('/event/list', getAllEvents)
  router.post('/event/book', bookEvent)
  router.post('/event/cancel', getAllEvents)
}

