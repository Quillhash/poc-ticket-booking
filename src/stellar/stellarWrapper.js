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
        console.log(`Success! Results (createChildAccount): ${result._links.transaction.href}`)
        return result
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
          console.log(`Success! Results (changeTrust): ${result._links.transaction.href}`)
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
        transaction.sign(masterSigner || srcKey)
        return server.submitTransaction(transaction)
      })
      .then((result) => {
        console.log(`Success! Results (transfer): ${result._links.transaction.href}`)
        return true
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
        console.log(`Success! Results (makeOffer): ${result._links.transaction.href}`)
        return true
      })
      .catch((error) => {
        const errMsg = `Something went wrong! (makeOffer): ${getErrorCode(error)}`
        console.warn(errMsg)
        throw new Error(errMsg)
      })
  }

  const eventCreator = (masterAccount, masterAsset) => async (eventCode, limit) => {
    const issuerAccount = await createChildAccount(masterAccount, 10)
    const distributorAccount = await createChildAccount(masterAccount, 10)
    await changeTrust(distributorAccount, masterAsset, limit)
    await issueAsset(eventCode, issuerAccount, distributorAccount, limit)

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
    queryAllAsstes
  }
}