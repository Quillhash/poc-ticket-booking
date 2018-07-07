const ticketingFactory = (stellarServer, masterAsset, masterAssetdistributor) => {
  const bookTicket = async (user, event, amount = 1) => {
    // transfer masterAsset to user
    await stellarServer.transfer(masterAssetdistributor, user.publicKey(), 1, masterAsset)
      .then(() => console.log(`transfer masterAsset to user: completed`))

    // offer eventAsset
    await stellarServer.makeOffer(event.distributor, event.asset, masterAsset, amount, amount)
      .then(() => console.log(`offer eventAsset`))

    // user bid the eventAsset
    await stellarServer.makeOffer(user, masterAsset, event.asset, amount, amount)
      .then(() => console.log(`user bid the eventAsset`))

    // TODO: remove random number
    // return tracking id if success
    return Math.random()
  }

  const queryTicketCount = async (user, event) => {
    // basic flow: assume all trades were made through the system
    // check current balance
    // check total buy and sell
    // compare result

    const currentBalance = await stellarServer.queryBalance(user, event.asset)
      .then(result => {
        return result && result.balance
      })

    const [totalBuyTrades, totalSellTrades] = await stellarServer.queryAllTrades(user)
      .then(trades => {
        const compareTradeAsset = (baseAsset, counterAsset) => (trade) =>
          trade.base_asset_code === baseAsset.getCode()
          && trade.base_asset_issuer === baseAsset.getIssuer()
          && trade.counter_asset_code === counterAsset.getCode()
          && trade.counter_asset_issuer === counterAsset.getIssuer()

        const buyTrades = trades.filter(compareTradeAsset(masterAsset, event.asset)).length
        const sellTrades = trades.filter(compareTradeAsset(event.asset, masterAsset)).length

        return [buyTrades, sellTrades]
      })

    return (totalBuyTrades - totalSellTrades) < 0 ? 0 : Math.min(currentBalance, totalBuyTrades - totalSellTrades)
  }

  return {
    bookTicket,
    queryTicketCount
  }
}


module.exports = ticketingFactory

