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
        return e
      })
  }

  const getAllEvents = async (withAvailability = false) => {
    let allevents = eventStore.getAllEvents()
    if (withAvailability) {
      allevents = allevents.then(events => events.map(e =>
        getRemainingTicket(e.code)
          .then(remaining => {
            e.available = remaining
            return e
          })
      )).then(events => Promise.all(events))
    }
    return allevents
  }

  const bookEvent = async (userId, eventCode, amount = 1) => {
    const event = await eventStore.get(eventCode)
    if (!event) {
      return Promise.reject(new Error('EVENT_NOTFOUND'))
    }

    const remaining = await getRemainingTicket(eventCode)

    if (remaining <= 0) {
      return Promise.reject(new Error('EVENT_FULL'))
    }

    return await userStore.getOrCreate(userId)
      .then(user => ticketing.bookTicket(user.keypair, event, amount, user.uuid)
        .then(async hash => ({
          tx: hash,
          uuid: user.uuid,
          count: await ticketing.queryTicketCount(user.keypair, event),
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

    const ticketCount = await ticketing.queryTicketCount(user.keypair, event)
    if (ticketCount <= 0) {
      return Promise.reject(new Error('USER_NO_TICKET'))
    }

    return ticketing.burnTicket(user.keypair, event, amount, user.uuid)
      .then(async hash => ({
        tx: hash,
        uuid: user.uuid,
        count: await ticketing.queryTicketCount(user.keypair, event)
      }))
      .catch(() => {
        return Promise.reject(new Error('BURN_ERROR'))
      })
  }

  const cancelBooking = async (userId, eventCode, amount = 1) => {
    const user = await userStore.get(userId)
    if (!user) {
      return Promise.reject(new Error('USER_NOTFOUND'))
    }

    const event = await eventStore.get(eventCode)
    if (!event) {
      return Promise.reject(new Error('EVENT_NOTFOUND'))
    }

    const ticketCount = await ticketing.queryTicketCount(user.keypair, event)
    if (ticketCount <= 0) {
      return Promise.reject(new Error('USER_NO_TICKET'))
    }

    return ticketing.cancelBooking(user.keypair, event, amount, user.uuid)
      .then(async hash => ({
        tx: hash,
        uuid: user.uuid,
        count: await ticketing.queryTicketCount(user.keypair, event)
      }))
      .catch(err => {
        console.err(err)
        return Promise.reject(new Error('CANCEL_ERROR'))
      })
  }

  const getRemainingTicket = async (eventCode) => {
    const event = await eventStore.get(eventCode)
    if (!event) {
      return 0
    }
    return ticketing.queryRemainingTickets(event)
  }

  const praseBookingMemo = (memo) => {
    const matcher = new RegExp('B:(?<eventCode>\\w*):(?<uuid>[0-9]*)', 'g')
    const result = matcher.exec(memo)

    return !result || !result.groups
      ? null
      : {
        eventCode: result.groups['eventCode'],
        uuid: result.groups['uuid']
      }
  }

  const useTicketByTransaction = async (txId) => {
    const memo = await ticketing.queryTransactionMemo(txId).catch(() => '')
    const { eventCode, uuid } = praseBookingMemo(memo)

    if (!eventCode || !uuid) {
      return Promise.reject(new Error('INVALID_TX'))
    }

    const user = await userStore.getByUuid(uuid)

    return useTicket(user.userId, eventCode)
  }

  const confirmTicketByTransaction = async (txId) => {
    const memo = await ticketing.queryTransactionMemo(txId).catch(() => '')
    const { eventCode, uuid } = praseBookingMemo(memo)

    if (!eventCode || !uuid) {
      return Promise.reject(new Error('INVALID_TX'))
    }

    const user = await userStore.getByUuid(uuid)

    return getBookedCount(user.userId, eventCode)
      .then(async count => {
        if (count <= 0) {
          return Promise.reject(new Error('USER_NO_TICKET'))
        }

        return {
          tx: txId,
          user: user.toJSON(),
          count: count
        }
      })
  }

  const simpleBookEvent = async (eventCode, amount = 1) => {
    let startTime = Date.now()
    const event = await eventStore.get(eventCode)
    if (!event) {
      return Promise.reject(new Error('EVENT_NOTFOUND'))
    }

    const remaining = await getRemainingTicket(eventCode)
    console.log(`YY getRemainingTicket ${Date.now() - startTime}`); startTime = Date.now()

    if (remaining <= 0) {
      return Promise.reject(new Error('EVENT_FULL'))
    }


    return await userStore.getByPreInit(eventCode)
      .then(user => { console.log(`YY getUser ${Date.now() - startTime}`); startTime = Date.now(); return user })
      .then(user => ticketing.simpleBookEvent(user.keypair, event, amount, user.uuid)
        .then(async hash => ({
          tx: hash,
          uuid: user.uuid,
          count: amount // await ticketing.queryTicketCount(user.keypair, event),
        }))
        .then(ret => { console.log(`YY simpleBookEvent ${Date.now() - startTime}`); return ret; })
        .then(ret => {
          userStore.clearPreInit(user.userId)
          return ret
        }))
      .catch(err => {
        console.error(err)

        return Promise.reject(new Error('BOOK_ERROR'))
      })
  }

  const getEventByTitle = async (title) => {
    let startTime = Date.now()
    const event = await eventStore.get('GG02')
    console.log(`getEventByTitle: ${Date.now() - startTime}`)
    return event
  }

  return {
    createEvent,
    getAllEvents,
    getEventByTitle,
    bookEvent,
    simpleBookEvent,
    getBookedCount,
    getBookedEvents,
    cancelBooking,
    useTicket,
    getRemainingTicket,
    useTicketByTransaction,
    praseBookingMemo,
    confirmTicketByTransaction,

    // temporary solution for MVP
    stellarWrapper,
    userStore,
    eventStore,
    ticketing
  }
}