module.exports = () => {
  const StellarSdk = require('stellar-sdk')
  const stellarServerFactory = require('./stellarServer')
  const server = new StellarSdk.Server('https://horizon-testnet.stellar.org')
  StellarSdk.Network.useTestNetwork()
  const stellarServer = stellarServerFactory(server) 

  return stellarServer
}
