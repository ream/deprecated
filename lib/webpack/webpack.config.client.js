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

  if (!api.options.dev) {
    // Code splitting, only for client bundle
    config.optimization.splitChunks({
      chunks: 'all',
      name: (m, chunks, cacheGroup) => `chunk-${cacheGroup}`,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        common: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    })
  }
}
