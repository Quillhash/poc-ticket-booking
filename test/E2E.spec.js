const request = require('request-promise-native')

const {create} = require('./utils/masterAsset')
const randomId = require('./utils/randomId')

// TODO: setup new master asset

const doRequest = (apiPath, payload) => {
  const rootPath = 'http://localhost:3000'
  const options = {
    method: 'POST',
    uri: `${rootPath}/${apiPath}`,
    body: payload,
    json: true
  }

  return request(options)
}

const printResult = (result) => {
  console.log(JSON.stringify(result, null, 2))
}

describe('Ticketing E2E', () => {
  let server, masterAsset
  const userId = `t_${randomId(4)}`
  const masterAssetCode = 'TTTT'
  const eventCode = `E${randomId(3)}`
  const nonExistingEventCode = `N${randomId(3)}`

  before(async () => {
    masterAsset = await create(masterAssetCode, 100000000)
    server = require('./server')(masterAsset)
    await server.start()

    console.log('before test')
  })

  after(() => {
    server && server.stop()
    console.log('before each test')
  })


  it('Organizer creates Event', async () => {
    const payload = {
      'code': eventCode,
      'startDate': '2018-07-11T18:06:59.713Z',
      'endDate': '2018-07-11T18:06:59.713Z',
      'title': 'event title',
      'description': 'description',
      'coverImage': 'https://bit.ly/2N8jwHG',
      'venue': 'One Building',
      'host': 'One Group',
      'uuid': 'user unique id',
      'limit': 50
    }

    await doRequest('api/organizer/event/create', payload).then(printResult)
  })

  it('Organizer list Event', async () => {
    await doRequest('api/organizer/event/list', {})
      .then(printResult)
  })

  it('Attendee list Event', async () => {
    await doRequest('api/attendee/event/list', {}).then(printResult)
  })

  it('Attendee book Event', async () => {
    const payload = {
      userId,
      eventCode
    }
    await doRequest('api/attendee/event/book', payload).then(printResult)
  })

  it('Attendee book non existing event', async () => {
    const payload = {
      userId,
      'eventCode': nonExistingEventCode
    }
    await doRequest('api/attendee/event/book', payload).then(printResult)
  })

  it('Attendee book full event', async () => {
    const payload = {
      userId,
      'eventCode': 'CCD'
    }
    await doRequest('api/attendee/event/book', payload).then(printResult)
  })

  it('Attendee list booked', async () => {
    const payload = {
      userId,
    }
    await doRequest('api/attendee/event/booked', payload).then(printResult)
  })
})