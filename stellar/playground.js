require('dotenv/config')

const start2 = async () => {
  const config = require('./config')
  
  // initial system
  const stellarServer = require('./initStellarServer')()
  const userStore = require('./initUserStore')(config)
  const eventStore = require('./initEventStore')(config)
  const ticketingFactory = require('./ticketingFactory')

  const masterAsset = config.masterAsset
  const masterDistributorKey = config.masterDistributorKey

  const ticketing = ticketingFactory(stellarServer, masterAsset, masterDistributorKey)
  const eventCode = 'KKK'

  // create an event
  const event = await eventStore.getOrCreate(eventCode, stellarServer.eventCreator(eventCode, 1000, masterDistributorKey, masterAsset))

  // create a user
  const userId = 'superman'
  const user = await userStore.getOrCreate(userId, stellarServer.userCreator(event.distributor, event.asset, masterAsset))

  console.log(event)
  console.log(event.issuer.publicKey())
  console.log(user)

  // perform booking ticket
  return ticketing.bookTicket(user.keypair, event)
    .then(() => console.log( `booking completed`))
    .then(() => ticketing.queryTicketCount(user.keypair, event))
    .then(ticketCount => console.log( `total tickets: ${ticketCount}`))
    .then(() => ticketing.burnTicket(user.keypair, event))
    .then(() => console.log( `burning completed`))
    .then(() => ticketing.queryTicketCount(user.keypair, event))
    .then(ticketCount => console.log( `total tickets: ${ticketCount}`))
}

start2()
  .then(() => process.exit(0))

