module.exports = (config) => {
  const { firestoreUserRepository } = require('./userRepository')
  const { userStoreFactory } = require('./userStore')
  const userRepository = firestoreUserRepository(config.firebase)
  const userStore = userStoreFactory(userRepository)

  return userStore
}