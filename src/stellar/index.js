module.exports = (config) => {
  const stellarWrapper = require('./initStellarWrapper')(config)
  const userStore = require('./initUserStore')(config)
  const eventStore = require('./initEventStore')(config)
  const ticketingFactory = require('./ticketing')

  const masterAsset = config.masterAsset
  const masterAccount = config.masterDistributorKey

  stellarWrapper.setMasterSigner(masterAccount)
  const ticketing = ticketingFactory(stellarWrapper, masterAccount, masterAsset)

  eventStore.setEventCreator(stellarWrapper.eventCreator(masterAccount, masterAsset))
  userStore.setUserCreator(stellarWrapper.userCreator(masterAsset))

  const createEvent = (event) => {
    return eventStore.getOrCreate(event)
      .then(e => {
        console.log(e)
        return e
      })
  }

  const getAllEvents = async () => {
    return eventStore.getAllEvents()
      .then(events => events.map(e =>
        getRemainingTicket(e.code)
          .then(remaining => {
            e.available = remaining
            return e
          })
      )).then(events =>
        Promise.all(events)
      )
  }

  const bookEvent = async (userId, eventCode) => {
    const event = await eventStore.get(eventCode)
    if (!event) {
      return Promise.reject(new Error('EVENT_NOTFOUND'))
    }

    const remaining = await getRemainingTicket(eventCode)

    if (remaining <= 0) {
      return Promise.reject(new Error('EVENT_FULL'))
    }

    return await userStore.getOrCreate(userId)
      .then(user => ticketing.bookTicket(user.keypair, event)
        .then(async hash => ({
          tx: hash,
          count: await ticketing.queryTicketCount(user.keypair, event)
        })))
      .catch(err => {
        console.error(err)
        return Promise.reject(new Error('BOOK_ERROR'))
      })
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
          let ne
          e != null && (ne = e.toJSON()) && (ne.amount = parseInt(t.balance))
          return ne
        })))

    const bookedTickets = (await Promise.all(bookedTicketsPromise))
      .filter(t => t != null)

    return bookedTickets
  }

  const useTicket = async (userId, eventCode, amount = 1) => {
    const user = await userStore.get(userId)

    if (!user) {
      return Promise.reject(new Error('USER_NOTFOUND'))
    }

    const event = await eventStore.get(eventCode)
    if (!event) {
      return Promise.reject(new Error('EVENT_NOTFOUND'))
    }

    return ticketing.burnTicket(user.keypair, event, amount)
      .then(async hash => ({
        ts: hash,
        count: await ticketing.queryTicketCount(user.keypair, event)
      }))
      .catch(() => {
        return Promise.reject(new Error('BURN_ERROR'))
      })
  }

  const cancelBooking = async (userId, eventCode) => {
    const user = await userStore.get(userId)
    if (!user) {
      return Promise.reject(new Error('USER_NOTFOUND'))
    }

    const event = await eventStore.get(eventCode)
    if (!event) {
      return Promise.reject(new Error('EVENT_NOTFOUND'))
    }

    return ticketing.queryTicketCount(user.keypair, event).then(count => {
      if (count <= 0) {
        return Promise.reject(new Error('USER_NO_TICKET'))
      }

      return ticketing.cancelBooking(user.keypair, event)
        .then(async hash => ({
          tx: hash,
          count: await ticketing.queryTicketCount(user.keypair, event)
        }))
        .catch(err => {
          console.err(err)
          return Promise.reject(new Error('CANCEL_ERROR'))
        })
    })
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