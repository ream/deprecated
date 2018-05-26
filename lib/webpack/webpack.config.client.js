const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const baseConfig = require('./webpack.config.base')

VueSSRClientPlugin.__expression = `require('vue-server-renderer/client-plugin')`

module.exports = (api, config) => {
  baseConfig(api, config, 'client')

  config.merge({
    devtool: api.options.dev ? 'cheap-module-source-map' : false,
    output: {
      path: api.resolveOutDir('client')
    }
  })

  // Vue SSR plugin
  config.plugin('ssr').use(VueSSRClientPlugin, [
    {
      filename: 'client-manifest.json'
    }
  ])
}
