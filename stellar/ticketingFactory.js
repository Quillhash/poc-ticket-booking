const ticketingFactory = (stellarServer, masterAccount, masterAsset) => {
  const bookTicket = async (user, event, amount = 1) => {
    await stellarServer.changeTrust(user, event.asset, 100) // TODO: remove hard code trust limit
      .then(() => console.log('change trust: completed'))
    // transfer masterAsset to user
    await stellarServer.transfer(masterAccount, user.publicKey(), amount, masterAsset)
      .then(() => console.log('transfer masterAsset to user: completed'))

    // offer eventAsset
    await stellarServer.makeOffer(event.distributor, event.asset, masterAsset, amount, amount)
      .then(() => console.log('offer eventAsset'))

    // user bid the eventAsset
    await stellarServer.makeOffer(user, masterAsset, event.asset, amount, amount)
      .then(() => console.log('user bid the eventAsset'))

    // TODO: remove random number
    // return tracking id if success
    return Math.random()
  }

  const queryRemainingTickets = (event) => {
    return stellarServer.queryBalance(event.distributor, event.asset)
      .then(result => {
        return result && result.balance
      })
  }

  const queryTicketCount = async (user, event) => {
    //// basic flow: assume all trades were made through the system
    // check current balance
    // check burnt balance
    // check total buy and sell
    // compare result

    const currentBalance = await stellarServer.queryBalance(user, event.asset)
      .then(result => {
        return result && result.balance
      })

    const burntBalance = await stellarServer.queryOperations(user, 100, 'desc')
      .then(operations => 
        operations.filter(operation => 
          operation.type === 'payment'
          && operation.to === event.issuer.publicKey()
          && operation.asset_code === event.asset.getCode()
          && operation.asset_issuer === event.asset.getIssuer()
        ).length
      )

    const [totalBuyTrades, totalReturnTrades] = await stellarServer.queryAllTrades(user, 100)
      .then(trades => {
        const compareTradeAsset = (baseAsset, counterAsset, counterAccount) => (trade) =>
          trade.base_asset_code === baseAsset.getCode()
          && trade.base_asset_issuer === baseAsset.getIssuer()
          && trade.counter_asset_code === counterAsset.getCode()
          && trade.counter_asset_issuer === counterAsset.getIssuer()
          && trade.counter_account === counterAccount

        // count transactions that the counter party is Event Distributor
        const eventDistributorPk = event.distributor.publicKey()
        const buyTrades = trades.filter(compareTradeAsset(masterAsset, event.asset, eventDistributorPk)).length
        const returnTrades = trades.filter(compareTradeAsset(event.asset, masterAsset, eventDistributorPk)).length

        return [buyTrades, returnTrades]
      })

    const totalBalance = totalBuyTrades - totalReturnTrades - burntBalance
    return Math.min(currentBalance, totalBalance < 0 ? 0 : totalBalance)
  }

  const burnTicket = (user, event, amount = 1) => {
    return stellarServer.transfer(user, event.issuer.publicKey(), amount, event.asset)
      .then(() => console.log('burn token asset to issuer: completed'))
  }

  const queryBookedTickets = (user) => {
    return stellarServer.queryAllAsstes(user)
      .then(asset => asset.filter(a => a.asset_type !== 'native' && a.balance > 0)
        .map(a => ({
          eventCode: a.asset_code,
          balance: a.balance
        })))
  }

  return {
    bookTicket,
    queryRemainingTickets,
    queryTicketCount,
    burnTicket,
    queryBookedTickets,
  }
}


module.exports = ticketingFactory

