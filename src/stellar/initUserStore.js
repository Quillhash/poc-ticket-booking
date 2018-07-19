module.exports = (config) => {
  const { firestoreUserRepository, inMemoryUserRepository } = require('./userRepository')
  const { userStoreFactory } = require('./userStore')
  const userRepository = config.liveDataStore
    ? firestoreUserRepository(config.firebase)
    : inMemoryUserRepository()

  const userStore = userStoreFactory(userRepository)

  return userStore
}