const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const nodeExternals = require('webpack-node-externals')
const baseConfig = require('./webpack.config.base')

VueSSRServerPlugin.__expression = `require('vue-server-renderer/server-plugin')`

module.exports = (api, config) => {
  baseConfig(api, config, 'server')

  config.merge({
    output: {
      libraryTarget: 'commonjs2',
      path: api.resolveOutDir('server')
    },
    target: 'node'
  })

  // Vue SSR plugin
  config.plugin('ssr').use(VueSSRServerPlugin, [
    {
      filename: 'server-bundle.json'
    }
  ])

  config.externals([
    [
      'vue',
      'vuex',
      'vue-router',
      'vue-meta',
      nodeExternals({
        whitelist: [/\.(?!(?:js|json)$).{1,5}(\?.+)?$/i]
      })
    ]
  ])
}
