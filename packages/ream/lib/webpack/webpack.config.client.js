const webpack = require('webpack')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const { ownDir } = require('../utils/dir')
const baseConfig = require('./webpack.config.base')
const ProgressPlugin = require('./ProgressPlugin')

const addHMRSupport = config => {
  config.plugins.add('hmr', webpack.HotModuleReplacementPlugin)
  config.prepend(
    'entry.client',
    require.resolve('webpack-hot-middleware/client') +
      '?reload=true&path=/_ream/__hmr'
  )
}

const splitChunks = config => {
  config.plugins.add('split-vendor', webpack.optimize.CommonsChunkPlugin, [
    {
      name: 'vendor',
      minChunks: (module, count) => {
        // For modules that are used in at least 2 chunks
        return (
          module.context &&
          module.context.indexOf('node_modules') >= 0 &&
          !/\.css$/.test(module.request) &&
          count > 1
        )
      }
    }
  ])
  config.plugins.add('split-manifest', webpack.optimize.CommonsChunkPlugin, [
    {
      name: 'manifest'
    }
  ])
}

module.exports = (api, config) => {
  baseConfig(api, config, false)

  config.set('devtool', api.options.dev ? '#cheap-module-source-map' : false)
  config.set('entry.client', [ownDir('app/entries/client.js')])
  config.set('output.path', api.resolveDist('client'))
  // Vue SSR plugin
  config.plugins.add('ssr', VueSSRClientPlugin, [
    {
      filename: 'client-manifest.json'
    }
  ])

  if (api.options.dev) {
    addHMRSupport(config)
  } else {
    splitChunks(config)
  }

  config.plugins.add('no-emit', webpack.NoEmitOnErrorsPlugin)

  config.plugins.add('progress', ProgressPlugin, [
    {
      progress: api.options.progress
    }
  ])
}
