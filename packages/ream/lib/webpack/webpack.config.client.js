const fs = require('fs-extra')
const path = require('path')
const webpack = require('webpack')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const { ownDir } = require('../utils/dir')
const baseConfig = require('./webpack.config.base')

VueSSRClientPlugin.__expression = `require('vue-server-renderer/client-plugin')`

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

  const staticFolder = path.resolve(api.options.staticFolder || 'static')
  if (fs.existsSync(staticFolder)) {
    const CopyPlugin = require('copy-webpack-plugin')
    CopyPlugin.__expression = `require('copy-webpack-plugin')`
    config.plugin('copy-static').use(CopyPlugin, [
      [
        {
          from: staticFolder,
          to: '.'
        }
      ]
    ])
  }
}
