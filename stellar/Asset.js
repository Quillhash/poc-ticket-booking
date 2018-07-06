const { Keypair, Asset: StellarAsset } = require('stellar-sdk')

class Asset {
  constructor(code, issuer) {
    this._issuer = issuer
    this._code = code
  }

  get stellarAsset() {
    return new StellarAsset(this._code, this._issuer.publicKey())
  }

  get code() {
    return this._code
  }
}

module.exports = {
  Asset
}