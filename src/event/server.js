module.exports = (config) => {
  let app
  const start = async () => {
    app = await require('./initialExpress')(config)

    const stellar = require('./initStellar')(config)

    const qrGenerator = require('./initQrGenerator')(config)

    const routers = require('./routers')(stellar, qrGenerator)
    app.use('/api', routers)

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