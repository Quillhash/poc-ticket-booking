const ticketingFactory = (stellarServer, mediumAsset, mediumAssetdistributor) => {


  const bookTicket = async (user, event, amount = 1) => {
    // transfer mediumAsset to user
    await stellarServer.transfer(mediumAssetdistributor, user.publicKey(), 1, mediumAsset)
      .then(() => console.log(`transfer mediumAsset to user: completed`))

    // offer eventAsset
    await stellarServer.makeOffer(event.distributor, event.asset, mediumAsset, amount, amount)
      .then(() => console.log(`offer eventAsset`))

    // user bid the eventAsset
    await stellarServer.makeOffer(user, mediumAsset, event.asset, amount, amount)
      .then(() => console.log(`user bid the eventAsset`))

    // TODO: remove random number
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
