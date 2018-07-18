const StellarSdk = require('stellar-sdk')
const stellarUrl = 'https://horizon-testnet.stellar.org'
StellarSdk.Network.useTestNetwork()

const server = new StellarSdk.Server(stellarUrl)

module.exports = server