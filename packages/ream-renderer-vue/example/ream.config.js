const path = require('path')
const Renderer = require('../lib')

module.exports = {
  entry: path.join(__dirname, 'src/index.js'),
  renderer: new Renderer(),
  rootStaticFiles: ['foo.txt'],
  generate: {
    routes: [
      '/'
    ]
  }
}
