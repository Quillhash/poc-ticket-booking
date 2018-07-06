const ticketingFactory = (stellarServer, mediumAsset, mediumAssetdistributor) => {


  const bookTicket = async (user, event, amount = 1) => {
    // transfer mediumAsset to user
    await stellarServer.transfer(mediumAssetdistributor, user.publicKey(), 1, mediumAsset)
      .then(() => console.log(`transfer mediumAsset to user: completed`))

    // TODO: use actual bid/offer API
    // offer eventAsset
    // user bid the eventAsset
    await stellarServer.transfer(user, event.distributor.publicKey(), 1, mediumAsset)
      .then(() => console.log(`offer eventAsset`))
    await stellarServer.transfer(event.distributor, user.publicKey(), 1, event.asset)
      .then(() => console.log(`user bid the eventAsset`))

    // TODO: user randomID
    // return tracking id if success
    return Math.random()
  }

  return {
    bookTicket
  }
}


module.exports = {
  ticketingFactory
}
