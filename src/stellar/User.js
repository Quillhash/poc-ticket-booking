const { Keypair } = require('stellar-sdk')

class User {
  constructor(userId, publicKey, uuid = '') {
    this._userId = userId
    this._publicKey = publicKey
    this._uuid = uuid
  }

  get keypair() {
    return Keypair.fromPublicKey(this._publicKey)
  }

  get uuid() {
    return this._uuid
  }

  get userId() {
    return this._userId
  }

  toJSON() {
    return {
      user_id: this._userId,
      account_id: this._publicKey,
      uuid: this._uuid
    }
  }

  static fromJSON(user) {
    return new User(user.user_id, user.account_id, user.uuid)
  }
}

module.exports = { User }
