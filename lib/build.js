const webpack = require('webpack')
const rm = require('rimraf')
const createConfig = require('./create-config')
const _ = require('./utils')

function runWebpack(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) return reject(err)
      resolve(stats)
    })
  })
}

module.exports = function (options) {
  const clientConfig = createConfig(Object.assign({}, options, {
    type: 'client'
  })).toConfig()

  const serverConfig = createConfig(Object.assign({}, options, {
    type: 'server'
  })).toConfig()

  rm.sync(_.cwd(options.cwd, 'dist/*'))

  return Promise.all([clientConfig, serverConfig]
    .map(config => runWebpack(config)))
}
