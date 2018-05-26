const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const { ownDir } = require('../utils/dir')
const baseConfig = require('./webpack.config.base')

VueSSRClientPlugin.__expression = `require('vue-server-renderer/client-plugin')`

module.exports = (api, config) => {
  baseConfig(api, config, false)

  config.merge({
    devtool: api.options.dev ? 'cheap-module-source-map' : false,
    output: {
      path: api.resolveDist('client')
    }
  })

  config.entry('client').add(ownDir('app/entries/client.js'))

  // Vue SSR plugin
  config.plugin('ssr').use(VueSSRClientPlugin, [
    {
      filename: 'client-manifest.json'
    }
  ])
}
