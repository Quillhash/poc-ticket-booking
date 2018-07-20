const request = require('request-promise-native')
const { Keypair } = require('stellar-sdk')

const { create } = require('./utils/masterAsset')
const randomId = require('./utils/randomId')

const doRequest = (apiPath, payload, method = 'POST') => {
  const rootPath = `http://localhost:${process.env.PORT || 3000}`
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
  const masterAssetCode = 'TTTT'
  const masterIssuerSecret = 'SBIQ3MNIPU2BTWSYHKAYHX2D3465LWRPD4DXPSVEGDFJAZGIQII6SGOY'
  const masterDistributorSecret = 'SDWQCC4TKKCFUAWACSJHIZPADJG7MNCPT6OXGNTGRY5JHHQ7LWAWEA45'
  const eventCode = `E2E${randomId(3)}`
  const eventTitle = 'The Amazing Event'

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
      'title': eventTitle,
      'description': 'description',
      'coverImage': 'https://bit.ly/2N8jwHG',
      'venue': 'One Building',
      'host': 'One Group',
      'email': 'someone@example.com',
      'url': 'http://www.google.com/',
      'subtitle': 'Saturday, July 28 at 1:00 PM Knowledge Exchange Center - kx',
      'uuid': 'user unique id',
      'limit': 2
    }

    await doRequest('api/organizer/event/create', payload).then(printResult)
  })

  it('Attendee list ticket', async () => {
    const payload = {
      'requestSource': 'FACEBOOK',
      'locale': 'en',
      'action': 'list.events',
      'session': 'projects/catcatchatbot/agent/sessions/85b029b6-f847-418a-812a-ae9d5cc146c4',
      'parameters': {
        'event-title': ''
      },
      'senderId': '2238896416126713'
    }

    await doRequest('api/ticketing', payload)
      .then(printResult)
  })


  it('Attendee use ticket by transaction', async () => {
    const payload = {
      'requestSource': 'FACEBOOK',
      'locale': 'en',
      'action': 'events.tickets.book-yes',
      'session': 'projects/catcatchatbot/agent/sessions/85b029b6-f847-418a-812a-ae9d5cc146c4',
      'parameters': {
        'event-title': eventTitle
      },
      'senderId': '2238896416126713'
    }
    const bookingResponse = await doRequest('api/ticketing', payload)
    printResult(bookingResponse)

    const ret = await doRequest(`api/ticketing/confirm/${bookingResponse.tx}`, {}, 'GET')
    printResult(ret)

    await doRequest(`api/ticketing/useticket/${ret.tx}`, {}, 'GET')
      .then(printResult).catch(printError)

    await doRequest('api/organizer/event/list', {})
      .then(printResult)
  })

  // it('xx', () => {
  //   const { fbTemplate } = require('claudia-bot-builder')
  //   const toFbList = () => {
  //     const list = new fbTemplate.Generic()
  //     return list
  //       .addBubble('Claudia.js', 'Deploy Node.js microservices to AWS easily')
  //       .addImage('https://claudiajs.com/assets/claudiajs.png')
  //       // .addDefaultAction('https://github.com/claudiajs/claudia-bot-builder')
  //       .addButton('Say hello', 'HELLO')
  //       .addButton('Say helloXX', 'https://claudiajs.com/assets/claudiajs.png')
  //       .addBubble('Claudia Bot Builder')
  //       .addImage('https://claudiajs.com/assets/claudia-bot-builder-video.jpg')
  //       .addButton('Go to Github', 'https://github.com/claudiajs/claudia-bot-builder')
  //       .get()
  //   }

  //   printResult(toFbList())
  // })
})
