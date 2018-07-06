const start = async () => {
  console.log('started')
  setTimeout(() => {
    console.log('time out')
  }, 1000)

  setTimeout(() => {
    console.log('error')
    throw new Error('XXX')

  }, 5000)

  return 'x'
}

module.exports = {
  start
}