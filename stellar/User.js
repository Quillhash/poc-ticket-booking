const { Keypair } = require('stellar-sdk')

class User {
  constructor(userId, publicKey, memo = '') {
    this._userId = userId
    this._publicKey = publicKey
    this._memo = memo
  }

  get keypair() {
    return Keypair.fromPublicKey(this._publicKey)
  }

  toJSON() {
    return {
      userId: this._memo,
      account_id: this._publicKey,
      memo: this._memo
    }
  }

  static fromJSON(user) {
    return new User(user.userId, user.account_id, user.memo)
  }
}

module.exports = { User }
