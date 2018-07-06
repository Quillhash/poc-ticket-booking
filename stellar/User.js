const { Keypair } = require('stellar-sdk')

class User {
  constructor(userId, publicKey, secret, memo = '') {
    this._userId = userId
    this._publicKey = publicKey
    this._secret = secret
    this._memo = memo
  }

  get keypair() {
    return Keypair.fromSecret(this._secret)
  }

  toJSON() {
    return {
      userId: this._memo,
      account_id: this._publicKey,
      secret: this._secret,
      memo: this._memo
    }
  }

  static fromJSON(user) {
    return new User(user.userId, user.account_id, user.secret, user.memo)
  }
}

module.exports = { User }
