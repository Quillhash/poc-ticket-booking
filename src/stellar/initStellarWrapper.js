module.exports = ({stellarUrl, stellarNetwork}) => {
  const StellarSdk = require('stellar-sdk')
  const stellarWrapperFactory = require('./stellarWrapper')
  const server = new StellarSdk.Server(stellarUrl)
  stellarNetwork !== 'live' && StellarSdk.Network.useTestNetwork()
  const stellarWrapper = stellarWrapperFactory(server)

  return stellarWrapper
}
