const flatFileRepository = (filePath) => {
  const { sync } = require('flat-file-db');
  const db = sync(filePath);

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

  const close = () => {
    db.close()
  }

  return {
    put,
    get,
    del,
    close
  }
}

module.exports = {
  flatFileRepository
}