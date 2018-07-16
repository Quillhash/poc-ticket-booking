const { flatFileRepository } = require('./flatFileRepository')
const { firestoreRepository } = require('./firestoreRepository')

module.exports = {
  flatFileUserRepository: flatFileRepository,
  firestoreUserRepository: (serviceAccountKey, collectionName = 'users' ) => firestoreRepository(serviceAccountKey, collectionName)
}