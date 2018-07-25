const StellarSdk = require('stellar-sdk')

module.exports = (server) => {

  let masterSigner = null

  const setMasterSigner = (signer) => {
    masterSigner = signer
  }

  const getErrorCode = (err) => {
    try {
      const code = err.response.data.extras.result_codes
      return code.operations
        ? code.operations.join(', ')
        : code.transaction
          ? code.transaction.toString()
          : err
    }
    catch (error) {
      return err
    }
  }

  const safeMemoText = (text = '') => {
    return (!text || text.length <= 28)
      ? StellarSdk.Memo.text(text || '')
      : StellarSdk.Memo.text(text.substring(0, 28))
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
        .addMemo(safeMemoText(`${parentKey.publicKey()} `))
        .build()
      transaction.sign(masterSigner || parentKey)
      return server.submitTransaction(transaction)
    })
      .then(() => server.loadAccount(childKey.publicKey()))
      .then(childAccount => {
        const transaction = new StellarSdk.TransactionBuilder(childAccount)
          .addOperation(StellarSdk.Operation.setOptions({
            signer: {
              ed25519PublicKey: parentKey.publicKey(),
              weight: 1
            }
          }))
          .addMemo(safeMemoText('set options: signer'))
          .build()
        transaction.sign(childKey)
        return server.submitTransaction(transaction)
      })
      .then((result) => {
        // console.log(`Success! Results (createChildAccount): ${result._links.transaction.href}`)
        return result.hash
      })
      .then(() => childKey)
      .catch((error) => {
        const errMsg = `Something went wrong! (createChildAccount): ${getErrorCode(error)}`
        console.warn(errMsg)
        throw new Error(errMsg)
      })
  }

  const changeTrust = (accountKey, asset, limit = null) => {
    return server.loadAccount(accountKey.publicKey())
      .then(account => [account, account.balances.find(balance =>
        balance.asset_code === asset.getCode() &&
        balance.asset_issuer === asset.getIssuer()) != null
      ])
      .then(([account, trusted]) => {
        if (trusted) {
          return null
        }

        let changeTrustOpt = { asset }
        limit != null && !isNaN(limit) && (changeTrustOpt.limit = `${limit}`)

        const transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.changeTrust(changeTrustOpt))
          .addMemo(safeMemoText(`trust: ${asset.getCode()}`))
          .build()
        transaction.sign(masterSigner || accountKey)

        return server.submitTransaction(transaction)
      })
      .then((result) => {
        if (!result) {
          console.log('Already trusted')
        } else {
          // console.log(`Success! Results (changeTrust): ${result._links.transaction.href}`)
        }
        return true
      })
      .catch((error) => {
        const errMsg = `Something went wrong! (changeTrust): ${getErrorCode(error)}`
        console.warn(errMsg)
        throw new Error(errMsg)
      })
  }

  const issueAsset = async (assetCode, issuingAccount, distributorAccount, limit) => {
    var asset = new StellarSdk.Asset(assetCode, issuingAccount.publicKey())
    // First, the receiving account must trust the asset
    return changeTrust(distributorAccount, asset, limit)
      // Second, the issuing account actually sends a payment using the asset
      .then(() => transfer(issuingAccount, distributorAccount.publicKey(), limit, asset))
  }

  const transfer = (srcKey, desPublicKey, amount, asset = StellarSdk.Asset.native(), memo = null) => {
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
          .addMemo(safeMemoText(memo ? memo : `Tx: ${Date.now()}`))
          .build()
        transaction.sign(masterSigner || srcKey)
        return server.submitTransaction(transaction)
      })
      .then((result) => {
        // console.log(`Success! Results (transfer): ${result._links.transaction.href}`)
        return result.hash
      })
      .catch((error) => {
        const errMsg = `Something went wrong! (transfer): ${getErrorCode(error)}`
        console.warn(errMsg)
        throw new Error(errMsg)
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
        transaction.sign(masterSigner || srcKey)
        return server.submitTransaction(transaction)
      })
      .then((result) => {
        // console.log(`Success! Results (makeOffer): ${result._links.transaction.href}`)
        return result.hash
      })
      .catch((error) => {
        const errMsg = `Something went wrong! (makeOffer): ${getErrorCode(error)}`
        console.warn(errMsg)
        throw new Error(errMsg)
      })
  }

  const swap = (srcKey, sellingAsset, buyer, buyingAsset, sellingAmount, buyingPrice, memo = null) => {
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
          .addOperation(StellarSdk.Operation.manageOffer({
            selling: buyingAsset,
            buying: sellingAsset,
            amount: `${buyingPrice}`,
            price: sellingAmount,
            source: buyer.publicKey()
          }))
          .addMemo(safeMemoText(memo ? memo : `swap ${sellingAsset.getCode()} -> ${buyingAsset.getCode()}`))
          .build()
        transaction.sign(masterSigner || srcKey)
        return server.submitTransaction(transaction)
      })
      .then((result) => {
        return result.hash
      })
      .catch((error) => {
        const errMsg = `Something went wrong! (swap): ${getErrorCode(error)}`
        console.warn(errMsg)
        throw new Error(errMsg)
      })
  }

  const doIssueAsset = (masterAsset, eventCode, issuerAccount, distributorAccount, limit) => {
    var asset = new StellarSdk.Asset(eventCode, issuerAccount.publicKey())
    return server.loadAccount(issuerAccount.publicKey())
      .then((account) => {
        let changeTrustMasterOpt = { asset: masterAsset, source: distributorAccount.publicKey() }
        let changeTrustOpt = { asset: asset, source: distributorAccount.publicKey() }
        limit != null && !isNaN(limit) && (changeTrustMasterOpt.limit = `${limit}`, changeTrustOpt.limit = `${limit}`)

        const transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.changeTrust(changeTrustMasterOpt))
          .addOperation(StellarSdk.Operation.changeTrust(changeTrustOpt))
          .addOperation(StellarSdk.Operation.payment({
            destination: distributorAccount.publicKey(),
            asset: asset,
            amount: `${limit}`
          }))
          .addMemo(safeMemoText(`IssueAsset: ${eventCode}`))
          .build()
        transaction.sign(masterSigner || issuerAccount)

        return server.submitTransaction(transaction)
      })
      .then((result) => {
        return result.hash
      })
      .catch((error) => {
        const errMsg = `Something went wrong! (doIssueAsset): ${getErrorCode(error)}`
        console.warn(errMsg)
        throw new Error(errMsg)
      })
  }

  const doBookTicket = (masterAccount, masterAsset, user, event, amount, memo) => {
    return server.loadAccount(masterAccount.publicKey())
      .then(account => {
        const transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.changeTrust({
            asset: event.asset,
            source: user.publicKey()
          }))
          .addOperation(StellarSdk.Operation.payment({
            destination: user.publicKey(),
            asset: masterAsset,
            amount: `${amount}`
          }))
          .addOperation(StellarSdk.Operation.manageOffer({
            selling: event.asset,
            buying: masterAsset,
            amount: `${amount}`,
            price: amount,
            source: event.distributor.publicKey()
          }))
          .addOperation(StellarSdk.Operation.manageOffer({
            selling: masterAsset,
            buying: event.asset,
            amount: `${amount}`,
            price: amount,
            source: user.publicKey()
          }))
          .addMemo(safeMemoText(`${memo ? memo : `book:${event.asset.getCode()}`}`))
          .build()

        transaction.sign(masterSigner)
        return server.submitTransaction(transaction)
      })
      .then((result) => {
        return result.hash
      })
      .catch((error) => {
        const errMsg = `Something went wrong! (doBookTicket): ${getErrorCode(error)}`
        console.warn(errMsg)
        throw new Error(errMsg)
      })
  }

  // HACK: this is hack
  const preBookTicket = (masterAccount, masterAsset, user, event, amount, memo) => {
    return server.loadAccount(masterAccount.publicKey())
      .then(account => {
        const transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.changeTrust({
            asset: event.asset,
            source: user.publicKey()
          }))
          .addOperation(StellarSdk.Operation.payment({
            destination: user.publicKey(),
            asset: masterAsset,
            amount: `${amount}`
          }))
          .addOperation(StellarSdk.Operation.manageOffer({
            selling: event.asset,
            buying: masterAsset,
            amount: `${amount}`,
            price: amount,
            source: event.distributor.publicKey()
          }))
          // .addOperation(StellarSdk.Operation.manageOffer({
          //   selling: masterAsset,
          //   buying: event.asset,
          //   amount: `${amount}`,
          //   price: amount,
          //   source: user.publicKey()
          // }))
          .addMemo(safeMemoText(`${memo ? memo : `prebook:${event.asset.getCode()}`}`))
          .build()

        transaction.sign(masterSigner)
        return server.submitTransaction(transaction)
      })
      .then((result) => {
        return result.hash
      })
      .catch((error) => {
        const errMsg = `Something went wrong! (preBookTicket): ${getErrorCode(error)}`
        console.warn(errMsg)
        throw new Error(errMsg)
      })
  }

  // HACK: Simplify book event
  const simpleBookEvent = (masterAsset, user, event, amount, memo) => {
    let startTime = Date.now()
    return server.loadAccount(user.publicKey())
      .then(account => {
        let t = Date.now() - startTime
        startTime = Date.now()
        console.log(`loadAccount: ${t} ms`)
        const transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.manageOffer({
            selling: masterAsset,
            buying: event.asset,
            amount: `${amount}`,
            price: amount,
            source: user.publicKey()
          }))
          .addMemo(safeMemoText(`${memo ? memo : `prebook:${event.asset.getCode()}`}`))
          .build()

        t = Date.now() - startTime
        startTime = Date.now()
        console.log(`buildTransaction: ${t} ms`)
        transaction.sign(masterSigner)
        return server.submitTransaction(transaction)
      })
      .then((result) => {
        const t = Date.now() - startTime
        startTime = Date.now()
        console.log(`submitTransaction: ${t} ms`)
        return result.hash
      })
      .catch((error) => {
        const errMsg = `Something went wrong! (simpleBookEvent): ${getErrorCode(error)}`
        console.warn(errMsg)
        throw new Error(errMsg)
      })
  }

  const eventCreator = (masterAccount, masterAsset) => async (eventCode, limit) => {
    const issuerAccount = await createChildAccount(masterAccount, 5)
    const distributorAccount = await createChildAccount(masterAccount, 500)
    // await changeTrust(distributorAccount, masterAsset, limit)
    // await issueAsset(eventCode, issuerAccount, distributorAccount, limit)
    await doIssueAsset(masterAsset, eventCode, issuerAccount, distributorAccount, limit)
    return {
      code: eventCode,
      limit: limit,
      issuer: issuerAccount.publicKey(),
      distributor: distributorAccount.publicKey()
    }
  }

  const userCreator = (masterAsset) => async () => {
    return createChildAccount(masterSigner, 5)
      .then(userKey => {
        return changeTrust(userKey, masterAsset)
          .then(() => userKey)
      })
      .then(userKey => {
        return {
          publicKey: userKey.publicKey()
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

  const queryOperations = (srcKey, limit = 10, order = 'asc') => {
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

  const queryAllAsstes = (user) => {
    return server.loadAccount(user.publicKey())
      .then(account => account.balances)
  }

  const queryTransactionMemo = (txId) => {
    return server.transactions()
      .transaction(txId)
      .call()
      .then(result =>
        result.memo
      )
  }

  return {
    setMasterSigner,
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
    queryOperations,
    queryAllAsstes,
    swap,
    doBookTicket,
    queryTransactionMemo,
    preBookTicket,
    simpleBookEvent
  }
}