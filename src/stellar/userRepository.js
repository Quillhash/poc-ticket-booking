const { flatFileRepository } = require('./flatFileRepository')
const { firestoreRepository } = require('./firestoreRepository')
const { inMemoryRepository } = require('./inMemoryRepository')

module.exports = {
  flatFileUserRepository: flatFileRepository,
  firestoreUserRepository: (firebase, collectionName = 'users' ) => firestoreRepository(firebase, collectionName),
  inMemoryUserRepository: inMemoryRepository
}