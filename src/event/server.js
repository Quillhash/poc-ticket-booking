const start = async (config) => {
  const app = await require('./initialExpress')(config)

  const stellar = require('./initStellar')(config)

  const routers = require('./routers')(stellar)
  app.use('/api', routers)

  console.log('server started')
}

module.exports = {
  start
}