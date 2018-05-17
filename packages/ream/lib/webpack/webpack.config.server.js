const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const nodeExternals = require('webpack-node-externals')
const { ownDir } = require('../utils/dir')
const baseConfig = require('./webpack.config.base')

module.exports = (api, config) => {
  baseConfig(api, config, true)

  config.set('entry.server', [ownDir('app/entries/server.js')])
  config.set('output.libraryTarget', 'commonjs2')
  config.set('output.path', api.resolveDist('server'))
  // Vue SSR plugin
  config.plugins.add('ssr', VueSSRServerPlugin, [
    {
      filename: 'server-bundle.json'
    }
  ])
  config.set('target', 'node')
  config.set('externals', [
    nodeExternals({
      whitelist: [/\.(?!(?:js|json)$).{1,5}$/i]
    })
  ])
  config.set('devtool', api.options.dev ? '#source-map' : false)
}
