const { Keypair, Asset, TransactionBuilder, Operation } = require('stellar-sdk')
const server = require('./stellarServer')

const doLoadAccount = (userPublicKey) => {
  return server.loadAccount(userPublicKey)
    .catch(() => null)
}

// create a new account if not exist
const createAccount = (userPublicKey) => {
  return doLoadAccount(userPublicKey)
    .then(account => {
      if (account != null)
        return account

      return server.friendbot(userPublicKey).call()
        .then(() => doLoadAccount(userPublicKey))
    })
}

const hasAssetIssued = (asset) => {
  return server.assets()
    .forIssuer(asset.getIssuer())
    .forCode(asset.getCode())
    .call()
    .then(result => result.records.length > 0)
}

const changeTrust = (userKey, asset, limit = null) => {
  let changeTrustOpt = { asset }
  limit != null && !isNaN(limit) && (changeTrustOpt.limit = `${limit}`)

  return server.loadAccount(userKey.publicKey())
    .then(account => {
      const transaction = new TransactionBuilder(account)
        .addOperation(Operation.changeTrust(changeTrustOpt))
        .build()
      transaction.sign(userKey)
      return server.submitTransaction(transaction)
    })
}


const transfer = (srcKey, desPublicKey, amount, asset = Asset.native()) => {
  return server.loadAccount(desPublicKey)
    .catch(err => { throw err })
    .then(() => server.loadAccount(srcKey.publicKey()))
    .then(account => {
      const transaction = new TransactionBuilder(account)
        .addOperation(Operation.payment({
          destination: desPublicKey,
          asset: asset,
          amount: `${amount}`
        }))
        .build()

      transaction.sign(srcKey)
      return server.submitTransaction(transaction)
    })
}


const create = async (assetCode, balance, issuerKey = Keypair.random(), distributorKey = Keypair.random()) => {
  const masterIssuerKey = issuerKey
  const masterDistributorKey = distributorKey
  const asset = new Asset(assetCode, masterIssuerKey.publicKey())
  const isIssued = await hasAssetIssued(asset)
  if (isIssued) {
    return {
      masterIssuerKey,
      masterDistributorKey,
      asset
    }
  }

  console.log(`issuing new asset: ${balance} ${assetCode}`)
  console.log('    creating issuer/distributor account')
  await createAccount(masterIssuerKey.publicKey())
  await createAccount(masterDistributorKey.publicKey())

  console.log('    transfering asset to distributor')
  await changeTrust(masterDistributorKey, asset)
  await transfer(masterIssuerKey, masterDistributorKey.publicKey(), balance, asset)

  console.log('asset issued')
  return {
    masterIssuerKey,
    masterDistributorKey,
    asset
  }
}

module.exports = {
  create
}