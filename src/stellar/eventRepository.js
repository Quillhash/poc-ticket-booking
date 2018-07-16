const { flatFileRepository } = require('./flatFileRepository')
const { firestoreRepository } = require('./firestoreRepository')


module.exports = {
  flatFileEventRepository: flatFileRepository,
  firestoreEventRepository: (serviceAccountKey, collectionName) => firestoreRepository(serviceAccountKey, collectionName)
}