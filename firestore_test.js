const path = require('path')

const firebase = require('firebase-admin')

console.log(path.join(__dirname, 'serviceAccountKey.json'))
var serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'))

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
})

const db = firebase.firestore()

const testCollection = db.collection('test-event')

console.log(testCollection.doc('doc1').set({'message': 'Hello, World!'}))

console.log(testCollection.select('messge').get().then(d => console.log(d)))

const x = testCollection.select().get().then(x =>
  x.docs.map(d => d.id)
)

console.log(x.then(console.log))