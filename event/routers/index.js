const routers = (app) => {
  const { attendee, organizer } = require('../api')

  app.get('/', (req, res) => {
    res.status(200).send('Say Meow 🐱')
  })

  app.use('/attendee', attendee)
  app.use('/organizer', organizer)
}





module.exports = routers
