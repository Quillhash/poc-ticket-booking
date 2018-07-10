/*
  - create event
  - list all events
  - list events of creator
  - delete event 
*/

const router = require('express').Router()

// const e = {
//   startDate,
//   endDate,
//   title,
//   description,
//   coverImage,
//   venue,
//   host,
//   constraint
// }

const createEvent = (req, res) => {
  console.log('organizer')
  res.status(200).send('organizer')
}

const getAllEvents = () => {

}

const getEvent = () => {

}

router.get('/', createEvent)

module.exports = router

