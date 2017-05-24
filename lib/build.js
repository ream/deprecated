const webpack = require('webpack')
const rm = require('rimraf')

function runWebpack(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) return reject(err)
      resolve(stats)
    })
  })
}

module.exports = function(webpackConfig) {
  const clientConfig = webpackConfig.client
  const serverConfig = webpackConfig.server

  rm.sync(clientConfig.output.path + '/*')

  return Promise.all(
    [clientConfig, serverConfig].map(config => runWebpack(config))
  )
}
