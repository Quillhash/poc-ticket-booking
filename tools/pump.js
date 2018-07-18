const StellarSdk = require('stellar-sdk')
const stellarUrl = 'https://horizon-testnet.stellar.org'
StellarSdk.Network.useTestNetwork()

const server = new StellarSdk.Server(stellarUrl)

const targetUserPk = 'GBC6LGYGVPB2AI6UM3VZALSCLJHZQT5P5NEM3WUBCJBYND3EIYAQII63'
const dummySeed = StellarSdk.Keypair.random()

console.log('start pumping')
server.friendbot(dummySeed.publicKey()).call()
  .then(() => {
    console.log(`New user created: ${dummySeed.publicKey()}`)
  })
  .then(() => server.loadAccount(targetUserPk).then(() => console.log(`target user exists: ${targetUserPk}`)))
  .catch(err => {
    throw err
  })
  .then(() => server.loadAccount(dummySeed.publicKey()))
  .then(account => {
    console.log('transfering XLM')
    const transaction = new StellarSdk.TransactionBuilder(account)
      .addOperation(StellarSdk.Operation.payment({
        destination: targetUserPk,
        asset: StellarSdk.Asset.native(),
        amount: '9998.5'
      }))
      .addMemo(StellarSdk.Memo.text('your admirer'))
      .build()
    transaction.sign(dummySeed)
    return server.submitTransaction(transaction)
  })
  .then(() => {
    console.log('transfer completed')
    return server.loadAccount(targetUserPk)
      .then(account => account.balances.forEach(b => console.log(b)))
  })
  .then(() => {
    console.log('done')
  })
  .catch((err) => {
    console.error(err)
  })