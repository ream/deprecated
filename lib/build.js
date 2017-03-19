const webpack = require('webpack')
const createConfig = require('./create-config')

function runWebpack(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) return reject(err)
      resolve(stats)
    })
  })
}

module.exports = function (options) {
  const clientConfig = createConfig({
    cwd: options.cwd,
    html: options.html,
    type: 'client'
  })
  const serverConfig = createConfig({
    cwd: options.cwd,
    html: options.html,
    type: 'server'
  })

  return Promise.all([clientConfig, serverConfig]
    .map(config => runWebpack(config)))
}
