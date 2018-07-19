const { flatFileRepository } = require('./flatFileRepository')
const { firestoreRepository } = require('./firestoreRepository')
const { inMemoryRepository } = require('./inMemoryRepository')


module.exports = {
  flatFileEventRepository: flatFileRepository,
  firestoreEventRepository: (firebase, collectionName = 'events') => firestoreRepository(firebase, collectionName),
  inMemoryEventRepository: inMemoryRepository
}