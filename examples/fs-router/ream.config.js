const fsRouterPlugin = require('../../plugins/fs-router')

module.exports = {
  entry: './index.js',
  plugins: [
    fsRouterPlugin()
  ]
}
