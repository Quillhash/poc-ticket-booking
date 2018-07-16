module.exports = (config) => {
  const { firestoreEventRepository } = require('./eventRepository')
  const { eventStoreFactory } = require('./eventStore')
  const eventRepository = firestoreEventRepository(config.firebase)
  const eventStore = eventStoreFactory(eventRepository)

  return eventStore
}