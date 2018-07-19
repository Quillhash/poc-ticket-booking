module.exports = (config) => {
  const { firestoreEventRepository, inMemoryEventRepository } = require('./eventRepository')
  const { eventStoreFactory } = require('./eventStore')
  const eventRepository = config.liveDataStore
    ? firestoreEventRepository(config.firebase)
    : inMemoryEventRepository()

  const eventStore = eventStoreFactory(eventRepository)

  return eventStore
}