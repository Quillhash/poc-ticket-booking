const path = require('path')

const firebase = require('firebase-admin')

console.log(path.join(__dirname, 'serviceAccountKey.json'))
var serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'))

const app = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
})

const db = firebase.firestore(app)
const testCollection = db.collection('test-event')

const test = async () => {
  await testCollection.doc('doc1').set({ 'message': 'Hello, World!' }).then(console.log)
  await testCollection.select('messge').get().then(q => console.log(q.docs.map(d => d.get())))

  const x = await testCollection.select().get().then(x =>
    x.docs.map(d => d.id)
  )

  console.log(x)
}

test()