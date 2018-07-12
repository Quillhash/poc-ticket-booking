const StellarSdk = require('stellar-sdk')

const masterAssetCode = process.env.MEDIUM_ASSET_CODE
const masterIssuerKey = StellarSdk.Keypair.fromSecret(process.env.MEDIUM_ASSET_ISSUER)
const masterDistributorKey = StellarSdk.Keypair.fromSecret(process.env.MEDIUM_ASSET_DISTRIBUTOR)
const masterAsset = new StellarSdk.Asset(masterAssetCode, masterIssuerKey.publicKey())


module.exports = {
  port: parseInt(process.env.PORT) || 3000,
  masterIssuerKey,
  masterDistributorKey,
  masterAsset,
  UserDbPath: process.env.USERDB_PATH || 'user.db',
  EventDbPath: process.env.EVENTDB_PATH || 'event.db',
}
