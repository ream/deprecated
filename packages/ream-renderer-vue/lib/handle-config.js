const path = require('path')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const cssLoaders = require('./css-loaders')


module.exports = ({ ream, opts }, type) => {
  const config = type === 'server' ? ream.serverConfig : ream.clientConfig

  config.resolveLoader.modules
    .add(path.join(__dirname, '../node_modules'))

  const cssOptions = {
    minimize: !ream.dev,
    sourceMap: ream.dev,
    extract: !ream.dev,
    postcss: opts.postcss || { plugins: [] },
    fallbackLoader: require.resolve('vue-style-loader')
  }
  cssLoaders.standalone(config, cssOptions)

  config.module.rule('vue')
    .test(/\.vue$/)
    .use('vue-loader')
      .loader('vue-loader')
      .options({
        loaders: Object.assign({}, cssLoaders.vue(cssOptions), {
          js: 'babel-loader'
        })
      })

  if (type === 'server') {
    config.plugin('vue-ssr-server')
      .use(VueSSRServerPlugin)
  }

  if (type === 'client') {
    config.plugin('vue-ssr-client')
      .use(VueSSRClientPlugin)

    config.plugin('html')
      .tap(options => {
        options[0] = {
          inject: false,
          template: path.join(__dirname, './index.ejs')
        }
        return options
      })
  }

  if (!ream.dev) {
    config.plugin('extract-css')
      .use(ExtractTextPlugin, ['[name].css'])
  }
}
