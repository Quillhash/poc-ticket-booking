const StellarSdk = require('stellar-sdk')

class Event {
  constructor(code, limit, issuer, distributor) {
    this._code = code
    this._limit = limit
    this._issuer = issuer
    this._distributor = distributor
  }

  get code() {
    return this._code
  }

  get limit() {
    return this._limit
  }

  get issuer() {
    return StellarSdk.Keypair.fromPublicKey(this._issuer)
  }

  get distributor() {
    return StellarSdk.Keypair.fromPublicKey(this._distributor)
  }

  get asset() {
    return new StellarSdk.Asset(this.code, this.issuer.publicKey())
  }

  toJSON() {
    return {
      code: this._code,
      limit: this._limit,
      issuer: this._issuer,
      distributor: this._distributor
    }
  }

  static fromJSON(event) {
    return new Event(event.code, event.limit, event.issuer, event.distributor)
  }
}

module.exports = {Event}