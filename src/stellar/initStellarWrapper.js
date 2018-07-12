module.exports = () => {
  const StellarSdk = require('stellar-sdk')
  const stellarWrapperFactory = require('./stellarWrapper')
  const server = new StellarSdk.Server('https://horizon-testnet.stellar.org')
  StellarSdk.Network.useTestNetwork()
  const stellarWrapper = stellarWrapperFactory(server)

  return stellarWrapper
}
