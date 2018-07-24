const { User } = require('./User')

const randNum = (min = 100, max = 1000) => {
  return Math.floor(Math.random() * (max - min) + min)
}

const userStoreFactory = (userRepository) => {
  let stellarUserCreator = null

  const setUserCreator = (userCreator) => {
    stellarUserCreator = userCreator
  }

  const getOrCreate = async (userId, preInit = '') => {
    let user = await userRepository.get(userId)
    if (user) {
      return User.fromJSON(user)
    }

    return stellarUserCreator()
      .then(async stellarUser => {
        user = {
          user_id: userId,
          account_id: stellarUser.publicKey,
          uuid: `${Date.now()}${randNum()}`,
          preInit: preInit
        }

        await userRepository.put(userId, user)
        return User.fromJSON(user)
      })
  }

  const get = async (userId) => {
    let user = await userRepository.get(userId)
    return user ? User.fromJSON(user) : null
  }

  const getByUuid = async (uuid) => {
    let users = await userRepository.query('uuid', uuid)
    return users && users.length > 0 ? User.fromJSON(users[0]) : null
  }

  const getByPreInit = async (preInit) => {
    let users = await userRepository.query('preInit', preInit)
    return users && users.length > 0 ? User.fromJSON(users[0]) : null
  }

  const clearPreInit = async (userId) => {
    let user = await userRepository.get(userId)
    user && (user.preInit = '')
    return user && await userRepository.put(userId, user), User.fromJSON(user)
  }

  return {
    setUserCreator,
    getOrCreate,
    get,
    getByUuid,
    getByPreInit,
    clearPreInit
  }
}

module.exports = {
  userStoreFactory
}