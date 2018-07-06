const { User } = require('./User')

const userStoreFactory = (userRepository) => {
  const getOrCreate = async (userId, stellarUserCreator) => {
    let user = await userRepository.get(userId)
    if (user) {
      return User.fromJSON(user)
    }

    return stellarUserCreator()
      .then(stellarUser => {
        user = {
          userId: userId,
          account_id: stellarUser.publicKey,
          secret: stellarUser.secret,
          memo: Date.now()
        }

        userRepository.put(userId, user)
        return User.fromJSON(user)
      })
  }

  return {
    getOrCreate
  }
}

module.exports = {
  userStoreFactory
}