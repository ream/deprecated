const path = require('path')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const cssLoaders = require('./css-loaders')

module.exports = ({ ream, opts }, type) => {
  const config = type === 'server' ? ream.serverConfig : ream.clientConfig

  // Ensure that we don't bundle duplicated vue/vue-router
  // config.resolve.alias
  //   .set('vue$', ream.resolveCwd('node_modules/vue/dist/vue.runtime.esm'))
  //   .set('vue-router$', ream.resolveCwd('node_modules/vue-router'))

  config.resolve.modules
    .add(path.join(__dirname, '../node_modules'))

  config.resolveLoader.modules
    .add(path.join(__dirname, '../node_modules'))

  const cssOptions = {
    minimize: !ream.dev,
    sourceMap: ream.dev && (type === 'client'),
    extract: false,
    postcss: ream.buildOptions.postcss || { plugins: [] },
    fallbackLoader: require.resolve('vue-style-loader')
  }
  cssLoaders.standalone(config, cssOptions)

  const babelOptions = config.module.rule('js').use('babel-loader').store.get('options')
  config.module.rule('vue')
    .test(/\.vue$/)
    .use('vue-loader')
      .loader('vue-loader')
      .options({
        loaders: Object.assign({}, cssLoaders.vue(cssOptions), {
          js: {
            loader: 'babel-loader',
            options: babelOptions
          }
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
