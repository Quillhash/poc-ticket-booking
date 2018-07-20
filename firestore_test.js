const path = require('path')

const firebase = require('firebase-admin')

console.log(path.join(__dirname, 'serviceAccountKey.json'))
var serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'))

const app = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
})

const db = firebase.firestore(app)
var citiesRef = db.collection('cities')

const test = async () => {
  await citiesRef.doc('SF').set({
    name: 'San Francisco', state: 'CA', country: 'USA',
    capital: false, population: 860000
  })
  await citiesRef.doc('LA').set({
    name: 'Los Angeles', state: 'CA', country: 'USA',
    capital: false, population: 3900000
  })
  await citiesRef.doc('DC').set({
    name: 'Washington, D.C.', state: null, country: 'USA',
    capital: true, population: 680000
  })
  await citiesRef.doc('TOK').set({
    name: 'Tokyo', state: null, country: 'Japan',
    capital: true, population: 9000000
  })
  await citiesRef.doc('BJ').set({
    name: 'Beijing', state: null, country: 'China',
    capital: true, population: 21500000
  })

  return citiesRef.where('name', '==', 'Beijing').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data())
      })
    })
    .catch(err => {
      console.log('Error getting documents', err)
    })

}

test().then(() => console.log('done'))