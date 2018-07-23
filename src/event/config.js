const StellarSdk = require('stellar-sdk')
const path = require('path')

const masterAssetCode = process.env.MASTER_ASSET_CODE
const masterIssuerKey = StellarSdk.Keypair.fromSecret(process.env.MASTER_ASSET_ISSUER)
const masterDistributorKey = StellarSdk.Keypair.fromSecret(process.env.MASTER_ASSET_DISTRIBUTOR)
const masterAsset = new StellarSdk.Asset(masterAssetCode, masterIssuerKey.publicKey())
const stellarUrl = process.env.STELLAR_URL || 'https://horizon-testnet.stellar.org'
const stellarNetwork = process.env.STELLAR_NETWORK || 'test'

const confirmDomain = 'https://catcat.io/api/ticketing/confirm/'
const bucketName = 'ticketing-dlt-poc.appspot.com'

const serviceAccountKey = require(path.join(process.cwd(), 'serviceAccountKey.json'))
const firebase = require('firebase-admin')
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccountKey),
  storageBucket: 'ticketing-dlt-poc.appspot.com'
})

const liveDataStore = process.env.ENVIRONMENT == null || process.env.ENVIRONMENT === 'PROD'

module.exports = {
  port: parseInt(process.env.PORT) || 3000,
  masterIssuerKey,
  masterDistributorKey,
  masterAsset,
  firebase,
  stellarUrl,
  stellarNetwork,
  liveDataStore,
  confirmDomain,
  bucketName
}

