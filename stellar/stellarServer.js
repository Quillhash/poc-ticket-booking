const StellarSdk = require('stellar-sdk')

module.exports = (server) => {
  const safeMemoText = (text = '') => {
    if (!text || text.length <= 28) {
      return StellarSdk.Memo.text(text || '')
    }

    console.warn(`memo text cut off: ${text}`)
    
    return StellarSdk.Memo.text(text.substring(0, 28))

  }

  const hasAssetIssued = (asset) => {
    return server.assets()
      .forIssuer(asset.getIssuer())
      .forCode(asset.getCode())
      .call()
      .then(result => result.records.length > 0)
  }

  const createChildAccount = (parentKey, balance) => {
    const childKey = StellarSdk.Keypair.random()
    return server.loadAccount(parentKey.publicKey()).then((account) => {
      const transaction = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.createAccount({
          destination: childKey.publicKey(),
          source: parentKey.publicKey(),
          startingBalance: `${balance}`
        }))
        .addMemo(safeMemoText(`parent: ${parentKey.publicKey()} `))
        .build()
      transaction.sign(parentKey)
      return server.submitTransaction(transaction)
    }).then(response => childKey)
      .catch((error) => {
        console.error(`Something went wrong!, ${error}`)
        return false
      })
  }

  const changeTrust = (accountKey, asset, limit) => {
    return server.loadAccount(accountKey.publicKey())
      .then(account => {
        const transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.changeTrust({
            asset: asset,
            limit: `${limit}`
          }))
          .addMemo(safeMemoText(`trust: ${limit} ${asset.getCode()}`))
          .build()
        transaction.sign(accountKey)

        return server.submitTransaction(transaction)
      })
      .catch((error) => {
        console.error(`Something went wrong!, ${error}`)
      })
  }

  const issueAsset = async (assetCode, issuingAccount, distributorAccount, limit) => {
    var asset = new StellarSdk.Asset(assetCode, issuingAccount.publicKey())
    // First, the receiving account must trust the asset
    return changeTrust(distributorAccount, asset, limit)
      // Second, the issuing account actually sends a payment using the asset
      .then(() => transfer(issuingAccount, distributorAccount.publicKey(), limit, asset))
  }

  const transfer = (srcKey, desPublicKey, amount, asset = StellarSdk.Asset.native()) => {
    return server.loadAccount(desPublicKey)
      .catch(err => {
        throw err
      })
      .then(() => server.loadAccount(srcKey.publicKey()))
      .then((account) => {
        const transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.payment({
            destination: desPublicKey,
            asset: asset,
            amount: `${amount}`
          }))
          .addMemo(safeMemoText(`Tx: ${Date.now()}`))
          .build()
        transaction.sign(srcKey)
        return server.submitTransaction(transaction)
      })
      .then((result) => {
        console.log(`Success! Results: ${result._links.transaction.href}`)
        return true
      })
      .catch((error) => {
        console.error(`Something went wrong!, ${error}`)
        return false
      })
  }

  const makeOffer = (srcKey, sellingAsset, buyingAsset, sellingAmount, buyingPrice) => {
    return server.loadAccount(srcKey.publicKey())
      .then(account => {
        const transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.manageOffer({
            selling: sellingAsset,
            buying: buyingAsset,
            amount: `${sellingAmount}`,
            price: buyingPrice,
            source: srcKey.publicKey()
          }))
          .addMemo(safeMemoText(`${sellingAsset.getCode()} -> ${buyingAsset.getCode()}`))
          .build()
        transaction.sign(srcKey)
        return server.submitTransaction(transaction)
      })
      .then((result) => {
        console.log(`Success! Results: ${result._links.transaction.href}`)
        return true
      })
      .catch((error) => {
        console.error(`Something went wrong!, ${error}`)
        return false
      })
  }

  const eventCreator = (eventCode, balance, masterAccount, masterAsset) => async () => {
    const issuerAccount = await createChildAccount(masterAccount, 100)
    const distributorAccount = await createChildAccount(issuerAccount, 70)
    await changeTrust(distributorAccount, masterAsset, balance)
    await issueAsset(eventCode, issuerAccount, distributorAccount, balance)

    return {
      code: eventCode,
      limit: balance,
      issuer: issuerAccount.secret(),
      distributor: distributorAccount.secret()
    }
  }

  const userCreator = (parentAccount, asset, masterAsset) => async () => {
    return createChildAccount(parentAccount, 3)
      .then(userKey => {
        return changeTrust(userKey, asset, 100) // FIXME: remove hardcoded limit
          .then(() => changeTrust(userKey, masterAsset, 100))
          .then(() => userKey)
      })
      .then(userKey => {
        return {
          publicKey: userKey.publicKey(),
          secret: userKey.secret()
        }
      })
  }

  const queryAllTrades = (srcKey, limit = 10, order = 'asc') => {
    return server.trades()
      .forAccount(srcKey.publicKey())
      .limit(limit)
      .order(order)
      .call()
      .then(result => 
        result.records
      )
  }

  const queryOperations = (srcKey, limit=10, order = 'asc') => {
    return server.operations()
      .forAccount(srcKey.publicKey())
      .limit(limit)
      .order(order)
      .call()
      .then(result => 
        result.records
      )
  }

  const queryBalance = (user, asset) => {
    return server.loadAccount(user.publicKey())
      .then(account => account.balances.find(balance => 
        balance.asset_code === asset.getCode() &&
        balance.asset_issuer === asset.getIssuer())
      )
  }

  return {
    hasAssetIssued,
    createChildAccount,
    changeTrust,
    issueAsset,
    transfer,
    eventCreator,
    userCreator,
    makeOffer,
    queryAllTrades,
    queryBalance,
    queryOperations
  }
}