const StellarSdk = require('stellar-sdk')

class Asset {
  constructor(code, issuer) {
    this._issuer = issuer
    this._code = code
  }

  get stellarAsset() {
    return new StellarSdk.Asset(this._code, this._issuer.publicKey())
  }

  get code() {
    return this._code
  }
}

module.exports = {
  Asset
}