const request = require('request-promise-native')
const { Keypair } = require('stellar-sdk')

const { create } = require('./utils/masterAsset')
const randomId = require('./utils/randomId')

const doRequest = (apiPath, payload, method = 'POST') => {
  const rootPath = 'http://localhost:3000'
  const options = {
    method,
    uri: `${rootPath}/${apiPath}`,
    body: payload,
    json: true
  }

  return request(options)
}

const printResult = (result) => {
  console.log(JSON.stringify(result, null, 2))
}

const printError = (error) => {
  console.error(error.message)
}

describe('Ticketing E2E', () => {
  let server, masterAsset
  const userId = `t_${randomId(4)}`
  const masterAssetCode = 'TTTT'
  const masterIssuerSecret = 'SBIQ3MNIPU2BTWSYHKAYHX2D3465LWRPD4DXPSVEGDFJAZGIQII6SGOY'
  const masterDistributorSecret = 'SDWQCC4TKKCFUAWACSJHIZPADJG7MNCPT6OXGNTGRY5JHHQ7LWAWEA45'
  const eventCode = `E2E${randomId(3)}`
  const nonExistingEventCode = `NE2E${randomId(3)}`

  before(async () => {
    console.log('before test')
    masterAsset = await create(masterAssetCode, 100000000, Keypair.fromSecret(masterIssuerSecret), Keypair.fromSecret(masterDistributorSecret))
    server = require('./server')(masterAsset)
    await server.start()
  })

  after(() => {
    console.log('after test')
    server && server.stop()

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
      'email': 'someone@example.com',
      'uuid': 'user unique id',
      'limit': 2
    }

    await doRequest('api/organizer/event/create', payload).then(printResult)
  })

  it('Organizer list Event', async () => {
    await doRequest('api/organizer/event/list', {})
      .then(printResult)
  })

  it('Attendee list Event', async () => {
    await doRequest('api/attendee/event/list', {})
      .then(printResult)
  })

  it('Attendee book Event', async () => {
    const payload = {
      userId,
      eventCode
    }
    await doRequest('api/attendee/event/book', payload)
      .then(printResult)
  })

  it('Attendee book non existing event', async () => {
    const payload = {
      userId,
      'eventCode': nonExistingEventCode
    }
    await doRequest('api/attendee/event/book', payload)
      .then(printResult).catch(printError)
  })

  it('Attendee book full event', async () => {
    const payload = {
      userId,
      'eventCode': eventCode
    }
    await doRequest('api/attendee/event/book', payload).then(printResult)
    await doRequest('api/attendee/event/book', payload)
      .then(printResult).catch(printError)

  })

  it('Attendee list booked', async () => {
    const payload = {
      userId,
    }
    await doRequest('api/attendee/event/booked', payload).then(printResult)
  })

  it('Attendee cancel ticket', async () => {
    const payload = {
      userId,
      eventCode
    }
    await doRequest('api/attendee/event/cancel', payload).then(printResult)
  })

  it('Attendee use ticket', async () => {
    const payload = {
      userId,
      eventCode
    }
    await doRequest('api/attendee/event/useticket', payload).then(printResult)
  })

  it('Attendee use without ticket', async () => {
    const payload = {
      userId,
      eventCode
    }
    await doRequest('api/attendee/event/useticket', payload)
      .then(printResult).catch(printError)
  })

  it('Attendee use ticket by transaction', async () => {
    const payload = {
      userId,
      'eventCode': eventCode
    }
    const { tx } = await doRequest('api/attendee/event/book', payload)

    await doRequest(`api/attendee/event/useticket/${tx}`, {}, 'GET')
      .then(printResult).catch(printError)

    await doRequest('api/organizer/event/list', {})
      .then(printResult)
  })
})
