module.exports = (config) => {
  const AwesomeQRCode = require('../lib/awesome-qr-node')
  const { Image } = require('canvas')
  const path = require('path')

  const UUID = require('uuid-v4')
  const storage = config.firebase.storage()
  const bucket = storage.bucket()
  const url = config.confirmDomain
  const formatter = (data) => `${url}${data}`
  const bucketName = config.bucketName

  const logo = new Image()
  logo.src = path.join(__dirname, 'logo.png')

  const qrGenerator = (name, txData) => new Promise((resolve, reject) => {

    const filePath = `qr/${name}.png`
    let uuid = UUID()
    const streamOption = {
      uploadType: 'media',
      metadata: {
        contentType: 'image/png',
        metadata: {
          firebaseStorageDownloadTokens: uuid
        }
      }
    }
    new AwesomeQRCode().create({
      text: formatter(txData),
      size: 512,
      autoColor: true,
      margin: 10,
      correctLevel: AwesomeQRCode.CorrectLevel.Q,
      logoImage: logo,
      logoScale: 0.2,
      logoMargin: 3.5,
      logoCornerRadius: 0,
      callback: (imgData) => {
        if (imgData === undefined) {
          reject('failed to generate the QR code')
        } else {
          const stream = bucket.file(filePath).createWriteStream(streamOption)
          stream.write(imgData)
          stream.on('finish', () =>{
            const retUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filePath)}?alt=media&token=${uuid}`
            console.log(retUrl)
            resolve(retUrl)
          })
          stream.end()
        }
      }
    })
  })

  return qrGenerator
}