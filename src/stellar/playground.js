require('dotenv/config')

const start2 = async () => {
  const config = require('../event/config')

  // initial system
  const stellarServer = require('./initStellarServer')()
  const userStore = require('./initUserStore')(config)
  const eventStore = require('./initEventStore')(config)
  const ticketingFactory = require('./ticketingFactory')

  const masterAsset = config.masterAsset
  const masterAccount = config.masterDistributorKey

  stellarServer.setMasterSigner(masterAccount)

  const ticketing = ticketingFactory(stellarServer, masterAccount, masterAsset)
  const eventCode = 'KKK'

  eventStore.setEventCreator(stellarServer.eventCreator(masterAccount, masterAsset))
  userStore.setUserCreator(stellarServer.userCreator(masterAsset))

  // create an event
  const event = await eventStore.getOrCreate(eventCode, 1000)

  // create a user
  const userId = 'superman'
  const user = await userStore.getOrCreate(userId)

  console.log(masterAccount.publicKey())
  console.log(event)
  console.log(event.issuer.publicKey())
  console.log(user)

  // perform booking ticket
  return ticketing.bookTicket(user.keypair, event)
    .then(() => console.log( 'booking completed'))
    .then(() => ticketing.queryTicketCount(user.keypair, event))
    .then(ticketCount => console.log( `total tickets: ${ticketCount}`))
    .then(() => ticketing.burnTicket(user.keypair, event))
    .then(() => console.log( 'burning completed'))
    .then(() => ticketing.queryTicketCount(user.keypair, event))
    .then(ticketCount => console.log( `total tickets: ${ticketCount}`))
}

start2()
  .then(() => process.exit(0))

