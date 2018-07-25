module.exports = (config) => {
  let app
  const start = async () => {
    app = await require('./initialExpress')(config)

    const stellar = require('./initStellar')(config)

    const routers = require('./routers')(stellar)
    app.use('/v1', routers)

    console.log('server started')
  }

  const stop = () => {
    app.stop()
  }

  return {
    start,
    stop
  }
}