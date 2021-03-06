require('dotenv/config')
const request = require('request-promise-native')
const { Keypair } = require('stellar-sdk')
const { create } = require('./utils/masterAsset')
const randomId = require('./utils/randomId')
const config = require('../src/event/config')
const { Event } = require('../src/stellar/Event')
const microtime = require('microtime')

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

const section = (name) => {
  console.log(`*** ${name} ***`)
}

// const events = [{
//   'code': 'GG01',
//   'startDate': '2018-07-28T09:00:00.000Z',
//   'endDate': '2018-07-28T10:00:00.000Z',
//   'title': 'Tuesday Evening Ceramics',
//   'subtitle': 'Tuesday, July 24, 2018 7:00 PM @House 182',
//   'description': 'Do ceramics at our regular meetup! All skill levels welcome. See all our work ',
//   'coverImage': 'https://secure.meetupstatic.com/photo_api/event/rx1100x800/dt000ddfxff646a/sgc348cff06b/464942367.jpeg',
//   'venue': 'House 182',
//   'host': 'Ross and Jane J.',
//   'email': 'someone@example.com',
//   'url': 'https://www.facebook.com/BangkokPotteryClub',
//   'uuid': 'user unique id',
//   'limit': 10
// }, {
//   'code': 'GG02',
//   'startDate': '2018-07-28T09:00:00.000Z',
//   'endDate': '2018-07-28T10:00:00.000Z',
//   'title': 'Satoshi Square - Lightning Network Special',
//   'subtitle': 'Monday, July 30, 2018 7:00 PM @The Clubhouse Sports Bar & Grill',
//   'description': 'Lightning Network 101: Ryan Milbourne will be covering the problem Lightning Network is solving, its advantages and disadvantages, as well as the current state of Lightning Network Development.',
//   'coverImage': 'https://secure.meetupstatic.com/photo_api/event/rx1100x800/dt2737ffxffc600/sge64cef73ca/449330933.jpeg',
//   'venue': 'The Clubhouse Sports Bar & Grill',
//   'host': 'Jeremy B.',
//   'email': 'someone@example.com',
//   'url': 'https://www.meetup.com/Bangkok-Satoshi-Square/events/btqmtpyxkbnc/',
//   'uuid': 'user unique id',
//   'limit': 10
// }]

// {
//   title: 'Hyperledger 101',
//   image_url: `https://scontent.fbkk2-2.fna.fbcdn.net/v/t1.0-9/34794693_10155998076087479_3811012266577362944_n.jpg?_nc_cat=0&_nc_eui2=AeFcCK9v87b5B-BbpPAhoU2Ing-_26MwYfyBPCWzHyZMNinVMMR8zYX7yEI42UAiDDPZSa_a2oBus9G59wyCsp8vU3bhCek26GKZ1ygZeIZRng&oh=a37021d18af6f714cf77b43c65324ed7&oe=5BC5D293`,
//   subtitle: 'Saturday, July 28 at 1:00 PM at HUBBA',
//   default_action: {
//     type: 'web_url',
//     url: 'https://www.facebook.com/events/616312025409172/'
//   },
//   buttons: [
//     {
//       type: 'web_url',
//       url: 'https://www.facebook.com/events/616312025409172/',
//       title: 'See more detail'
//     },
//     {
//       type: 'postback',
//       title: 'Join Hyperledger 101',
//       payload: 'Join Hyperledger 101'
//     }
//   ]
// }

const events = [{
  'code': 'HL101',
  'startDate': '2018-07-28T13:00:00.000Z',
  'endDate': '2018-07-28T14:00:00.000Z',
  'title': 'Hyperledger 101',
  'subtitle': 'Saturday, July 28 at 1:00 PM at HUBBA',
  'description': '',
  'coverImage': 'https://scontent.fbkk2-2.fna.fbcdn.net/v/t1.0-9/34794693_10155998076087479_3811012266577362944_n.jpg?_nc_cat=0&_nc_eui2=AeFcCK9v87b5B-BbpPAhoU2Ing-_26MwYfyBPCWzHyZMNinVMMR8zYX7yEI42UAiDDPZSa_a2oBus9G59wyCsp8vU3bhCek26GKZ1ygZeIZRng&oh=a37021d18af6f714cf77b43c65324ed7&oe=5BC5D293',
  'venue': 'HUBBA',
  'host': 'HUBBA',
  'email': 'rabbotioz@gmail.com',
  'url': 'https://www.facebook.com/events/616312025409172/',
  'uuid': 'user unique id',
  'limit': 50
},
{
  'code': 'ZZ102',
  'startDate': '2018-07-28T09:00:00.000Z',
  'endDate': '2018-07-28T10:00:00.000Z',
  'title': 'Lightning Network Special',
  'subtitle': 'Monday, July 30, 2018 7:00 PM @The Clubhouse Sports Bar & Grill',
  'description': 'Lightning Network 101: Ryan Milbourne will be covering the problem Lightning Network is solving, its advantages and disadvantages, as well as the current state of Lightning Network Development.',
  'coverImage': 'https://secure.meetupstatic.com/photo_api/event/rx1100x800/dt2737ffxffc600/sge64cef73ca/449330933.jpeg',
  'venue': 'The Clubhouse Sports Bar & Grill',
  'host': 'Jeremy B.',
  'email': 'someone@example.com',
  'url': 'https://www.meetup.com/Bangkok-Satoshi-Square/events/btqmtpyxkbnc/',
  'uuid': 'user unique id',
  'limit': 100
}]

describe('Ticking Manual System Initialization ', () => {
  let server, masterAsset, stellarModule
  const masterAssetCode = 'TTTT'
  const masterIssuerSecret = 'SBIQ3MNIPU2BTWSYHKAYHX2D3465LWRPD4DXPSVEGDFJAZGIQII6SGOY'
  const masterDistributorSecret = 'SDWQCC4TKKCFUAWACSJHIZPADJG7MNCPT6OXGNTGRY5JHHQ7LWAWEA45'

  before(async () => {
    section('before test')
    masterAsset = await create(masterAssetCode, 100000000, Keypair.fromSecret(masterIssuerSecret), Keypair.fromSecret(masterDistributorSecret))

    config.masterIssuerKey = masterAsset.masterIssuerKey
    config.masterDistributorKey = masterAsset.masterDistributorKey
    config.masterAsset = masterAsset.asset
    config.liveDataStore = true

    stellarModule = require('../src/stellar')(config)
    section('end before test')
  })

  after(() => {
    console.log('after test')
    server && server.stop()
  })

  it('Create events', async () => {
    section('create event')
    let promise = Promise.resolve()

    const createdEvent = await stellarModule.eventStore.getAllEvents()

    events.filter(e => createdEvent.find(c => c.code === e.code) == null)
      .forEach(event => {
        promise = promise.then(() => {
          console.log(`creating: ${event.title} (${event.code})`)
          return stellarModule.eventStore.getOrCreate(event).then(printResult)
        })
      })

    await promise
  })

  it('Organizer list Event', async () => {
    await stellarModule.eventStore.getAllEvents()
      .then(printResult)
  })

  it('Prepare Users for Event, and offer', async () => {
    section('Prepare Users for Event, and offer')
    let promise = Promise.resolve()

    await stellarModule.eventStore.getAllEvents().then(events => {
      events.map(e => new Event(e)).forEach(event => {
        [...Array(event.limit)].forEach(() => {
          promise = promise.then(() => {
            const userId = `${microtime.now()}`
            console.log(`creating user: ${userId} for event: ${event.code}`)
            return stellarModule.userStore.getOrCreate(userId, event.code)
              .then(user =>
                stellarModule.stellarWrapper.preBookTicket(config.masterDistributorKey, config.masterAsset, user.keypair, event, 1, '')
              )
              .then(printResult)
              .then(() =>
                stellarModule.userStore.get(userId)
              )
              .then(printResult)
          })
        })
      })
    })
    await promise.catch(printError)
  })
})