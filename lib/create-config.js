const fs = require('fs')
const webpack = require('webpack')
const Config = require('webpack-chain')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const VueSSRPlugin = require('vue-ssr-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const _ = require('./utils')
const cssLoaders = require('./css-loaders')

function getFilenames(hash) {
  return {
    js: hash ? '[name].[chunkhash:8].js' : '[name].js',
    css: hash ? '[name].[contenthash:8].css' : '[name].css',
    static: hash ? 'static/[name].[hash:8].[ext]' : 'static/[name].[ext]'
  }
}

module.exports = function ({
  type, // ['server', 'client']
  dev, // True / false
  cwd = _.cwd(),
  extendWebpack,
  html,
  entry = 'src/index.js',
  homepage = '/dist/',
  postcss = {},
  babel,
  externalsWhitelist = []
} = {}) {
  const config = new Config()
  const isServer = type === 'server'
  const isClient = type === 'client'

  const publicPath = dev ? '/dist/' : homepage

  const filename = getFilenames(!dev)

  // Add alias
  config.resolve.alias
    .set('@owndir', _.ownDir())
    .set('@cwd', _.cwd(cwd))
    .set('@alias/entry$', _.cwd(cwd, entry))
    .set('@alias/webpack-hot-middleware-client$', `webpack-hot-middleware/client?reload=true`)

  if (dev && type === 'clent') {
    _.tweakTime(_.cwd(cwd, entry))
  }

  // Resolve extensions
  config.resolve.extensions
    .add('.js')
    .add('.json')
    .add('.vue')

  // Resolve modules and loader
  config.resolve.modules
    .add(_.cwd(cwd, 'node_modules'))
    .add(_.cwd('node_modules')) // Always resolve modules in process.cwd()
    .add(_.ownDir('node_modules'))

  config.resolveLoader.modules
    .add(_.cwd(cwd, 'node_modules'))
    .add(_.cwd('node_modules')) // Always resolve loaders in process.cwd()
    .add(_.ownDir('node_modules'))

  // Disable performance
  config.performance
    .hints(false)

  // Loaders
  config.module
    .rule('js')
      .test(/\.js$/)
      .include
        .add(_.ownDir('app'))
        .add(filepath => {
          // For anything outside node_modules
          if (filepath.split(/[/\\]/).indexOf('node_modules') === -1) {
            return true
          }
        })
        .end()
      .use('babel')
        .loader('babel-loader')
        .end()
      .end()
    .rule('vue')
      .test(/\.vue$/)
      .use('vue')
        .loader('vue-loader')
        .end()
      .end()

  config.module
    .rule('static-files')
      .test(/\.(ico|jpg|png|gif|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/)
      .use('file')
        .loader('file-loader')
        .options({
          name: filename.static
        })
        .end()
      .end()
    .rule('svg')
      .test(/\.(svg)(\?.*)?$/)
      .use('svg')
        .loader('file-loader')
        .options({
          name: filename.static
        })
        .end()
      .end()

  cssLoaders.standalone({
    extract: !dev && isClient,
    sourceMap: true
  }).forEach(loaders => {
    const rule = config.module
      .rule(loaders.extension)
      .test(loaders.test)
    const use = rule.use.bind(rule)
    if (dev || isServer) {
      loaders.use
        .forEach(loader => use(loader).loader(loader))
    } else {
      loaders.use
        .forEach(loader => use(loader.loader).loader(loader.loader).options(loader.options))
    }
  })

  const staticDir = _.cwd(cwd, 'static')
  if (fs.existsSync(staticDir)) {
    // Copy ./static to ./dist
    config.plugin('copy-static')
      .use(CopyPlugin, [[{
        from: staticDir,
        to: '.'
      }]])
  }

  // Loader options
  config.plugin('loaderOptions')
    .use(webpack.LoaderOptionsPlugin, [{
      minimize: !dev,
      options: {
        context: _.cwd(cwd),
        postcss,
        babel: babel && (babel.babelrc !== false) ? babel : {
          babelrc: false,
          presets: [require.resolve('babel-preset-vue-app')]
        },
        vue: {
          loaders: Object.assign(cssLoaders.vue({
            extract: false,
            sourceMap: dev // Since we inline all css of .vue component, only enable sourceMap in dev mode, otherwise it will increase bundle size
          }), {
            js: 'babel-loader'
          })
        }
      }
    }])

  // Define envs
  config.plugin('defineEnvs')
    .use(webpack.DefinePlugin, [{
      'process.env': {
        NODE_ENV: JSON.stringify(dev ? 'development' : 'production'),
        VUE_ENV: JSON.stringify(type),
        BROWSER_BUILD: JSON.stringify(type === 'client')
      }
    }])

  if (isClient) {
    config
      .entry('client')
        .add(_.ownDir('app/client-entry.js'))
        .end()
      .output
        .path(_.cwd(cwd, '.ream/dist'))
        .filename(filename.js)
        .publicPath(publicPath)
        .end()

    // Generate hmtl
    config.plugin('html')
      .use(HtmlWebpackPlugin, [Object.assign({
        title: 'ream',
        template: _.ownDir('app/index.html')
      }, html)])

    if (dev) {
      config
        .devtool('eval-source-map')
        .entry('client')
          .prepend(_.ownDir('app/dev-client.js'))
          .end()
        .plugin('hmr')
          .use(webpack.HotModuleReplacementPlugin)
          .end()
    } else {
      // https://github.com/webpack-contrib/css-loader/issues/454
      config.node.set('Buffer', false)

      config
        .devtool('source-map')
        .plugin('uglify')
          .use(webpack.optimize.UglifyJsPlugin, [{
            sourceMap: true,
            /* eslint-disable camelcase */
            compressor: {
              warnings: false,
              conditionals: true,
              unused: true,
              comparisons: true,
              sequences: true,
              dead_code: true,
              evaluate: true,
              if_return: true,
              join_vars: true,
              negate_iife: false
            },
            /* eslint-enable camelcase */
            output: {
              comments: false
            }
          }])

      config.node
        .set('fs', 'empty')
        .set('net', 'empty')
        .set('tls', 'empty')

      config.plugin('commons-chunk-vendor')
        .use(webpack.optimize.CommonsChunkPlugin, [{
          name: 'vendor',
          minChunks: (module, count) => {
            if (!module.resource) return false

            // If it's not in node_module, never split
            if (!/\/node_modules\//.test(module.resource)) {
              return false
            }

            // Split dependencies we always use
            if (/\/node_modules\/(ream|vue|vuex|vue-router|es6-promise|vuex-router-sync)/.test(module.resource)) {
              return true
            }

            // If it's JS/CSS file
            // Only split when used in 2 or more chunks
            if (count > 1 && /\.(css|js)$/.test(module.resource)) {
              return true
            }

            return false
          }
        }])

      config.plugin('commons-chunk-manifest')
        .use(webpack.optimize.CommonsChunkPlugin, [{
          name: 'manifest'
        }])
    }
  }

  if (isServer) {
    config
      .devtool(dev ? 'source-map' : false)
      .entry('server')
        .add(_.ownDir('app/server-entry.js'))
        .end()
      .output
        .path(_.cwd(cwd, '.ream/dist'))
        .filename('server-bundle.js')
        .libraryTarget('commonjs2')
        .publicPath(publicPath)

    config.target('node')

    config.externals([
      nodeExternals({
        whitelist: [/\.css$/].concat(externalsWhitelist)
      })
    ])

    config.plugin('ssr')
      .use(VueSSRPlugin, [{
        entry: 'server'
      }])
  }

  if (!dev && isClient) {
    config.plugin('extract-css')
      .use(ExtractTextPlugin, [filename.css])
  }

  extendWebpack && extendWebpack(config, { type, dev })

  return config
}
