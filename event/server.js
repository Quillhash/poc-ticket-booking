const start = async (config) => {
  const app = await require('./initialExpress')(config)
  
  const routers = require('./routers')
  routers(app)

  console.log('server started')
}

module.exports = {
  start
}