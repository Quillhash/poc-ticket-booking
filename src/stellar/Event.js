const StellarSdk = require('stellar-sdk')

class Event {
  constructor({
    code,
    limit,
    startDate,
    endDate,
    title,
    description,
    coverImage,
    venue,
    host,
    email,
    uuid,
    constraint,
    issuer,
    distributor }) {

    this._code = code
    this._limit = limit

    this._startDate = startDate
    this._endDate = endDate
    this._title = title
    this._description = description
    this._coverImage = coverImage
    this._venue = venue
    this._host = host
    this._email = email
    this._uuid = uuid
    this._constriaint = constraint

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
      startDate: this._startDate,
      endDate: this._endDate,
      title: this._title,
      description: this._description,
      coverImage: this._coverImage,
      venue: this._venue,
      host: this._host,
      email: this._email,
      uuid: this._uuid,
      constraint: this._constriaint,

      issuer: this._issuer,
      distributor: this._distributor
    }
  }

  static fromJSON(event) {
    return new Event(event)
  }
}

module.exports = { Event }