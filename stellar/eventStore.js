const { Event } = require('./Event')


const eventStoreFactory = (eventRepository) => {
  getOrCreate = async (eventCode, stellarEventCreator) => {
    let event = await eventRepository.get(eventCode)
    if (event) {
      return Event.fromJSON(event)
    }

    return stellarEventCreator()
      .then(stellarEvent => {
        console.log(`new event created: ${stellarEvent.code}`)
        eventRepository.put(eventCode, stellarEvent)
        return Event.fromJSON(stellarEvent)
      })
  }

  return {
    getOrCreate
  }
}

module.exports = {
  eventStoreFactory
}