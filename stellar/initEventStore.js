module.exports = (config) => {
  const { flatFileEventRepository } = require('./eventRepository')
  const { eventStoreFactory } = require('./eventStore')
  const eventRepository = flatFileEventRepository(config.EventDbPath)
  const eventStore = eventStoreFactory(eventRepository)

  return eventStore
}