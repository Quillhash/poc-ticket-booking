const firestoreRepository = (firebase, collectionName) => {
  const db = firebase.firestore()
  const collection = db.collection(collectionName)

  const put = (key, value) => {
    return collection.doc(key).set(value)
  }

  const get = (key) => {
    return collection.doc(key).get()
      .then(doc => {
        if (!doc.exists) {
          return null
        } else {
          return doc.data()
        }
      })
  }

  const has = (key) => {
    return get(key).then(data => {
      return !data
    })
  }

  const del = (key) => {
    return collection.doc(key).delete()
  }

  const keys = () => {
    return collection.select().get().then(x => x.docs.map(d => d.id))
  }

  const query = (field, value) => {
    return collection.where(field, '==', value).get()
      .then(sanpshot => {
        return sanpshot.docs.map(doc => doc.data())
      })
      .catch(err => {
        console.log('Error getting documents', err)
        return null
      })
  }

  const close = () => {
  }

  return {
    put,
    get,
    del,
    close,
    has,
    keys,
    query,
  }
}

module.exports = {
  firestoreRepository
}