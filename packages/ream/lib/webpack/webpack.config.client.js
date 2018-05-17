const webpack = require('webpack')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const { ownDir } = require('../utils/dir')
const baseConfig = require('./webpack.config.base')
const ProgressPlugin = require('./ProgressPlugin')

const addHMRSupport = config => {
  config.plugin('hmr').use(webpack.HotModuleReplacementPlugin)

  config
    .entry('client')
    .prepend(
      require.resolve('webpack-hot-middleware/client') +
        '?reload=true&path=/_ream/__hmr'
    )
}

module.exports = (api, config) => {
  baseConfig(api, config, false)

  config.merge({
    devtool: api.options.dev ? '#cheap-module-source-map' : false,
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

  if (api.options.dev) {
    addHMRSupport(config)
  }

  config.plugin('progress').use(ProgressPlugin, [
    {
      progress: api.options.progress
    }
  ])
}
