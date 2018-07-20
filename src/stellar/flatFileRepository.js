const flatFileRepository = (filePath) => {
  const { sync } = require('flat-file-db')
  const db = sync(filePath)

  const put = (key, value) => {
    return new Promise((resolve) => db.put(key, value, resolve))
  }

  const get = async (key) => {
    return db.get(key)
  }

  const has = async (key) => {
    return db.has(key)
  }

  const del = (key) => {
    return new Promise((resolve) => db.del(key, resolve))
  }

  const keys = async() => {
    return db.keys()
  }

  const close = () => {
    db.close()
  }

  const query = async (field, value) => {
    return db.keys()
      .filter(k => db.get(k)[field] === value)
      .map(k => db.get(k))
  }

  return {
    put,
    get,
    del,
    close,
    has,
    keys,
    query
  }
}

module.exports = {
  flatFileRepository
}