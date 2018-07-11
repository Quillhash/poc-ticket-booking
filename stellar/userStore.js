const { User } = require('./User')

const userStoreFactory = (userRepository) => {
  let stellarUserCreator = null

  const setUserCreator = (userCreator) => {
    stellarUserCreator = userCreator
  }

  const getOrCreate = async (userId) => {
    let user = await userRepository.get(userId)
    if (user) {
      return User.fromJSON(user)
    }

    return stellarUserCreator()
      .then(stellarUser => {
        user = {
          userId: userId,
          account_id: stellarUser.publicKey,
          memo: Date.now()
        }

        userRepository.put(userId, user)
        return User.fromJSON(user)
      })
  }

  const get = async (userId) => {
    let user = await userRepository.get(userId)

    return user ? User.fromJSON(user) : null
  }

  return {
    setUserCreator,
    getOrCreate,
    get
  }
}

module.exports = {
  userStoreFactory
}