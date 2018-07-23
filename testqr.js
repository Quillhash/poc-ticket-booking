const AwesomeQRCode = require('awesome-qr')
const fs = require('fs')
// const logo = require('./logo.png')

const {Image} = require('canvas')


const img = new Image()
img.src = './logo.png'

// const qr = new AwesomeQRCode().create({
//   text: 'Makito loves Kafuu Chino.',
//   size: 500,
//   autoColor: true,
//   margin: 10,
//   correctLevel: AwesomeQRCode.CorrectLevel.Q,
//   logoImage: img,
//   logoScale: 0.2,
//   logoMargin: 0,
//   logoCornerRadius: 8,
//   callback: (data) => {
//     if (data === undefined) {
//       console.log('failed to generate the QR code')
//     } else {
//       // play with binary PNG data
//       console.log('png data')
//       fs.writeFile('qr-out.png', data, (err) =>
//         err && console.error(err))
//     }
//   }
// })

describe('XX', () => {
  it ('done', (done) => {
    const qr = new AwesomeQRCode().create({
      text: 'https://catcat.io/api/ticketing/confirm/15790e61ed6990c2af3597607c1b0a32467fcde1b70c2eecae6f52e488683fd3',
      size: 500,
      autoColor: true,
      margin: 10,
      correctLevel: AwesomeQRCode.CorrectLevel.M,
      // backgroundImage: img,
      // dotScale: 1,
      // maskedDots: true,
      logoImage: img,
      logoScale: 0.2,
      logoMargin: 3,
      logoCornerRadius: 0,
      callback: (data) => {
        if (data === undefined) {
          console.log('failed to generate the QR code')
        } else {
          // play with binary PNG data
          console.log('png data')
          fs.writeFile('qr-out.png', data, (err) =>
            err && console.error(err))

          done()
        }
      }
    })

  })
})