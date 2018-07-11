require('dotenv/config')

const config = require('./config')
const stellarEngine = require('../stellar')(config)

const runner = async (userId, eventCode) => {
  console.log(`>>> getAllEvents ${userId} ${eventCode} <<<`)
  await stellarEngine.getAllEvents()
    .then(ret => console.log(JSON.stringify(ret)))

  console.log(`>>> createEvent ${userId} ${eventCode} <<<`)
  await stellarEngine.createEvent({ code: eventCode, limit: 987 })
    .then(event => console.log(event))

  console.log(`>>> bookEvent ${userId} ${eventCode} <<<`)
  await stellarEngine.bookEvent(userId, eventCode)
    .then(count => console.log(`Booked ticket: ${count}`))
    .then(() => stellarEngine.getBookedCount(userId, eventCode))
    .then(count => console.log(`Booked tickets of user ${userId} for Event ${eventCode} are ${count}`))
    .then(() => stellarEngine.getRemainingTicket(eventCode))
    .then(remaining => console.log(`RemainingTicket for Event ${eventCode} are ${remaining}`))

  console.log(`>>> getBookedEvents ${userId} ${eventCode} <<<`)
  await stellarEngine.getBookedEvents(userId)
    .then(ret => console.log(`Booked event of user ${userId}: ${JSON.stringify(ret)}`))

  console.log(`>>> useTicket ${userId} ${eventCode} <<<`)
  await stellarEngine.useTicket(userId, eventCode)
    .then(ret => console.log(`Remaining tickets of event ${eventCode}: ${ret}`))

  console.log(`>>> getBookedEvents ${userId} ${eventCode} <<<`)
  await stellarEngine.getBookedEvents(userId)
    .then(ret => console.log(`Booked event of user ${userId}: ${JSON.stringify(ret)}`))
}

runner('superman', 'BBB')
  .then(() => runner('superman2', 'BBB'))
  .then(() => runner('superman', 'BBC')) 
  .then(() => runner('superman2', 'BBC')) 
  .then(() => console.log('done'))





/*
{
  _code: eventCode,
  _limit: 987,
  _issuer: 'GBFMXUEICUITMA7TS44RJX4A6UB2JVE4LWUO47GONKOVROXHHJLXVTNU'
  _distributor: 'GD52VUNAQPY662GC2BE6VW2C7B5CICKO5KJXPKPE4WEHNYC6QM2YBJVY' 
}
*/