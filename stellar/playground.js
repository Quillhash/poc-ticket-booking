require('dotenv/config')

const StellarSdk = require('stellar-sdk')

const chalk = require('chalk')
console.log(chalk.yellow('Let\'s begin'))


const start2 = async () => {
  const StellarSdk = require('stellar-sdk')
  const { flatFileUserRepository } = require('./userRepository')
  const { flatFileEventRepository } = require('./eventRepository')
  const { userStoreFactory } = require('./userStore')
  const { eventStoreFactory } = require('./eventStore')
  const { Asset } = require('./Asset')
  const stellarServerFactory = require('./stellarServer')
  const { ticketingFactory } = require('./ticketing')


  const config = require('./config')

  StellarSdk.Network.useTestNetwork()

  const server = new StellarSdk.Server('https://horizon-testnet.stellar.org')
  const stellarServer = stellarServerFactory(server)
  const userRepository = flatFileUserRepository('user.db')
  const eventRepository = flatFileEventRepository('event.db')

  const userStore = userStoreFactory(userRepository)
  const eventStore = eventStoreFactory(eventRepository)

  const mediumIssuerAccount = StellarSdk.Keypair.fromSecret(config.MediumAssetIssuer)
  const mediumAsset = new Asset(config.MediumAssetCode, mediumIssuerAccount)
  const distributorAccount = StellarSdk.Keypair.fromSecret(config.MediumAssetDistributor)

  const ticketing = ticketingFactory(stellarServer, mediumAsset.stellarAsset, distributorAccount)

  const event = await eventStore.getOrCreate('JKL', stellarServer.eventCreator('JKL', 1000, distributorAccount, mediumAsset))
  const user = await userStore.getOrCreate('superman', stellarServer.userCreator(event.distributor, event.asset))

  console.log(event)
  console.log(user)

  return ticketing.bookTicket(user.keypair, event)
}

start2().then((d) => console.log(d))




const key = StellarSdk.Keypair.fromSecret('SBSBLDENU6GSG4U7PC7DFE2R2Y3ZRQK6DSSH3GZQQXCRVNKKTSRGBUFE')

console.log(key.publicKey())

const key2 = StellarSdk.Keypair.fromSecret('SB2AHYNC3QHFWJ43YJO5TYVWVFAYZEVBXOEHKVACAGGAYB6IAIKMQN2Z')

console.log(key2.publicKey())