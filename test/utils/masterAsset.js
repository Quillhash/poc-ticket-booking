const { Keypair, Asset, TransactionBuilder, Operation } = require('stellar-sdk')
const server = require('./stellarServer')

const createAccount = (userPublicKey) => {
  return server.friendbot(userPublicKey).call()
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


const create = async (assetCode, balance) => {
  console.log(`issuing new asset: ${balance} ${assetCode}`)
  const masterIssuerKey = Keypair.random()
  const masterDistributorKey = Keypair.random()

  console.log('    creating issuer/distributor account')
  await createAccount(masterIssuerKey.publicKey())
  await createAccount(masterDistributorKey.publicKey())

  console.log('    transfering asset to distributor')
  var asset = new Asset(assetCode, masterIssuerKey.publicKey())
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