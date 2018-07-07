module.exports = (config) => {
  const { flatFileUserRepository } = require('./userRepository')
  const { userStoreFactory } = require('./userStore')
  const userRepository = flatFileUserRepository(config.UserDbPath)
  const userStore = userStoreFactory(userRepository)

  return userStore
}