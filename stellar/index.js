module.exports = (config) => {
  const stellarServer = require('./initStellarServer')()
  const userStore = require('./initUserStore')(config)
  const eventStore = require('./initEventStore')(config)
  const ticketingFactory = require('./ticketingFactory')

  const masterAsset = config.masterAsset
  const masterAccount = config.masterDistributorKey

  stellarServer.setMasterSigner(masterAccount)
  const ticketing = ticketingFactory(stellarServer, masterAccount, masterAsset)

  eventStore.setEventCreator(stellarServer.eventCreator(masterAccount, masterAsset))
  userStore.setUserCreator(stellarServer.userCreator( masterAsset))

  const createEvent = (event) => {
    const eventCode = event.code
    const limit = event.limit
    return eventStore.getOrCreate(eventCode, limit).then(e => ({
      eventCode: e.code,
      limit: e.limit,
    }))
  }

  const getAllEvents = () => {
    return eventStore.getAllEvents()
      .then(events => events.map(e => ({
        eventCode: e.code,
        limit: e.limit,
      })))
  }

  const bookEvent = async (userId, eventCode) => {
    const event = await eventStore.get(eventCode)
    if (!event) {
      return false
    }

    return await userStore.getOrCreate(userId)
      .then(user => ticketing.bookTicket(user.keypair, event)
        .then(() => ticketing.queryTicketCount(user.keypair, event)))
      .catch(() => -1)
  }

  const getBookedCount = async (userId, eventCode) => {
    const event = await eventStore.get(eventCode)
    if (!event) {
      return 0
    }

    const user = await userStore.get(userId)
    return !user
      ? 0
      : await ticketing.queryTicketCount(user.keypair, event)
  }

  const getBookedEvents = async (userId) => {
    const user = await userStore.get(userId)

    if (!user) {
      return []
    }

    const bookedTicketsPromise = await ticketing.queryBookedTickets(user.keypair)
      .then(ticktes => ticktes.map(t => eventStore.get(t.eventCode)
        .then(e => {
          e != null && (e.balance = t.balance)
          return e
        })))
      
    const bookedTickets = (await Promise.all(bookedTicketsPromise))
      .filter(t => t != null).map(t => ({
        eventCode: t.code,
        balance: t.balance
      }))

    return bookedTickets
  }

  const useTicket = async (userId, eventCode, amount = 1) =>  {
    const user = await userStore.get(userId)

    if (!user) {
      return false
    }

    const event = await eventStore.get(eventCode)
    if (!event) {
      return false
    }

    return ticketing.burnTicket(user.keypair, event, amount)
      .then(() => ticketing.queryTicketCount(user.keypair, event))
      .catch(() => -1)
  }

  const cancelBooking = async () => {
    return true
  }

  const getRemainingTicket = async (eventCode) => {
    const event = await eventStore.get(eventCode)
    if (!event) {
      return 0
    }
    return ticketing.queryRemainingTickets(event)
  } 

  

  return {
    createEvent,
    getAllEvents,
    bookEvent,
    getBookedCount,
    getBookedEvents,
    cancelBooking,
    useTicket,
    getRemainingTicket
  }
}