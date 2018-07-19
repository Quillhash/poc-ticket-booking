const { Network, Server, Keypair, Operation, TransactionBuilder, Memo, Asset } = require('stellar-sdk')
const stellarUrl = 'https://horizon-testnet.stellar.org'
Network.useTestNetwork()

const server = new Server(stellarUrl)

const targetUserPk = 'GC6VENR3SP6W2LXD67WHL6AP4ICG2QI2GS7JVYXJZTYGUD3KADZSOV6E'
const dummySeed = Keypair.random()

console.log('start pumping')
server.loadAccount(targetUserPk)
  .then(() => console.log(`target user exists: ${targetUserPk}`))
  .catch(err => { throw err })
  .then(() => server.friendbot(dummySeed.publicKey()).call())
  .then(() => console.log(`new user created: ${dummySeed.publicKey()}`))
  .then(() => server.loadAccount(dummySeed.publicKey()))
  .then(account => {
    console.log('transfering XLM')
    const transaction = new TransactionBuilder(account)
      .addOperation(Operation.payment({
        destination: targetUserPk,
        asset: Asset.native(),
        amount: '9998.5'
      }))
      .addMemo(Memo.text('your admirer'))
      .build()
    transaction.sign(dummySeed)
    return server.submitTransaction(transaction)
  })
  .then(() => {
    console.log('transfer completed')
    return server.loadAccount(targetUserPk)
      .then(account => account.balances
        .filter(b => b.asset_type === 'native')
        .forEach(b => console.log(`current balance: ${b.balance}`)))
  })
  .then(() => console.log('done'))
  .catch((err) => {
    console.error(err)
  })