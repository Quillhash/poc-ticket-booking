const inMemoryRepository = () => {
  let _store = {}

  const put = async (key, value) => {
    return _store[key] = value, value
  }

  const get = async (key) => {
    return _store[key]
  }

  const has = async (key) => {
    return Object.keys(_store).findIndex(k => k === key) >= 0
  }

  const del = async(key) => {
    const value = _store[key]
    delete _store[key]
    return value
  }

  const keys = async() => {
    return Object.keys(_store)
  }

  const close = () => {
    _store = {}
  }

  const query = async (field, value) => {
    return Object.keys(_store)
      .filter(k => _store[k][field] === value)
      .map(k => _store[k])
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
  inMemoryRepository
}