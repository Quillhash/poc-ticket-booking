const { Event } = require('./Event')


const eventStoreFactory = (eventRepository) => {
  let stellarEventCreator = null

  const setEventCreator = (eventCreator) => {
    stellarEventCreator = eventCreator
  }

  const getOrCreate = async (eventCode, limit = 1000) => {
    let event = await eventRepository.get(eventCode)
    if (event) {
      return Event.fromJSON(event)
    }

    return stellarEventCreator(eventCode, limit)
      .then(stellarEvent => {
        console.log(`new event created: ${stellarEvent.code}`)
        eventRepository.put(eventCode, stellarEvent)
        return Event.fromJSON(stellarEvent)
      })
  }

  const getAllEvents = async () => {
    const eventsPromises = await eventRepository.keys()
      .then(keys => keys.map(async k => await eventRepository.get(k)))
    
    return await Promise.all(eventsPromises)
  }

  const get = async (eventCode) => {
    let event = await eventRepository.get(eventCode)
    if (event) {
      return Event.fromJSON(event)
    }
  }

  return {
    setEventCreator,
    getOrCreate,
    getAllEvents,
    get
  }
}

module.exports = {
  eventStoreFactory
}