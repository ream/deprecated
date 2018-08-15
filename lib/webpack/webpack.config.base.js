const path = require('path')
const webpack = require('webpack')
const TimeFixPlugin = require('time-fix-plugin')
const { ownDir, inWorkspace } = require('../utils/dir')

const resolveModules = config => {
  const modules = [
    path.resolve('node_modules'),
    inWorkspace ? ownDir('../../node_modules') : ownDir('node_modules'),
    'node_modules'
  ]
  config.resolve.modules.merge(modules)
  config.resolveLoader.modules.merge(modules)
  config.resolve.set('symlinks', true)
  config.resolveLoader.set('symlinks', true)
  config.resolveLoader.set('alias', {
    'ream-babel-loader': require.resolve('./loaders/ream-babel-loader'),
    'vue-loader': require.resolve('vue-loader')
  })
}

module.exports = (api, config, type) => {
  config.resolve.alias
    .set('#app-entry$', api.resolveBaseDir(api.options.entry))
    .set('#base', api.baseDir)
    .set('#out', api.resolveOutDir())
    .set('#app', ownDir('app'))

  if (api.options.runtimeCompiler) {
    config.resolve.alias.set('vue$', 'vue/dist/vue.esm.js')
  }

  config.entry(type).add(ownDir(`app/${type}-entry.js`))

  // Add HMR support
  if (type === 'client' && api.options.dev) {
    config.entry(type).prepend(require.resolve('webpack-hot-middleware/client'))
    config.plugin('hmr').use(webpack.HotModuleReplacementPlugin)
  }

  const publicPath = '/_ream/'
  const filename = api.options.dev ? '[name].js' : '[name].[chunkhash:8].js'
  config.merge({
    mode: api.options.dev ? 'development' : 'production',
    performance: {
      hints: false
    },
    output: {
      filename,
      chunkFilename: filename,
      publicPath
    },
    optimization: {
      minimize: false
    }
  })

  // No need to minimize in server or dev mode
  if (type === 'client' && !api.options.dev && api.options.minimize !== false) {
    config.merge({
      optimization: {
        minimize: true,
        minimizer: [
          {
            apply(compiler) {
              // eslint-disable-next-line import/no-extraneous-dependencies
              const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
              new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                  output: {
                    comments: false,
                    beautify: false
                  },
                  ie8: false
                }
              }).apply(compiler)
            }
          },
          {
            apply(compiler) {
              // eslint-disable-next-line import/no-extraneous-dependencies
              const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
              new OptimizeCSSAssetsPlugin().apply(compiler)
            }
          }
        ]
      }
    })
  }

  // prettier-ignore
  webpack.DefinePlugin.__expression = 'webpack.DefinePlugin'
  config.plugin('constants').use(webpack.DefinePlugin, [
    {
      'process.env.NODE_ENV': JSON.stringify(
        api.options.dev ? 'development' : 'production'
      ),
      'process.server': type === 'server',
      'process.browser': type === 'client',
      'process.client': type === 'client',
      __DEV__: Boolean(api.options.dev),
      __PUBLIC_PATH__: JSON.stringify(publicPath)
    }
  ])

  resolveModules(config)

  const babelOptions = {
    cacheDirectory: true,
    reamPresetOptions: {
      isServer: type === 'server',
      dev: api.options.dev,
      defaultBabelPreset: api.options.defaultBabelPreset
    }
  }

  // prettier-ignore
  config.module.rule('js')
    .test(/\.js$/)
    .include
      .add(filepath => {
        // Transpile enhanceAppFiles
        if ([...api.enhanceAppFiles].some(p => filepath.startsWith(p))) {
          return true
        }
        // Ream's own app
        if (filepath.startsWith(ownDir('app'))) {
          return true
        }
        return !/node_modules/.test(filepath)
      })
      .end()
    .use('babel-loader')
      .loader('ream-babel-loader')
      .options(babelOptions)

  // prettier-ignore
  config.module
    .rule('vue')
    .test(/\.vue$/)
    .use('vue-loader')
      .loader('vue-loader')

  const { VueLoaderPlugin } = require('vue-loader')
  VueLoaderPlugin.__expression = `require('vue-loader').VueLoaderPlugin`
  config.plugin('vue').use(VueLoaderPlugin)

  const inlineLimit = 10000

  // prettier-ignore
  config.module
    .rule('images')
    .test(/\.(png|jpe?g|gif)(\?.*)?$/)
    .use('url-loader')
    .loader('url-loader')
    .options({
      limit: inlineLimit,
      name: `assets/img/[name].[hash:8].[ext]`
    })

  // do not base64-inline SVGs.
  // https://github.com/facebookincubator/create-react-app/pull/1180
  // prettier-ignore
  config.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .use('file-loader')
    .loader('file-loader')
    .options({
      name: `assets/img/[name].[hash:8].[ext]`
    })

  // prettier-ignore
  config.module
    .rule('media')
    .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
    .use('url-loader')
    .loader('url-loader')
    .options({
      limit: inlineLimit,
      name: `assets/media/[name].[hash:8].[ext]`
    })

  // prettier-ignore
  config.module
    .rule('fonts')
    .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
    .use('url-loader')
    .loader('url-loader')
    .options({
      limit: inlineLimit,
      name: `assets/fonts/[name].[hash:8].[ext]`
    })

  const isProd = !api.options.dev
  const { extract } = api.options.css

  if (extract && type === 'client') {
    const cssFilename = filename.replace(/\.js$/, '.css')
    config.plugin('extract-css').use(require('mini-css-extract-plugin'), [
      {
        filename: cssFilename,
        chunkFilename: cssFilename
      }
    ])
  }

  function createCSSRule(lang, test, loader, options) {
    const baseRule = config.module.rule(lang).test(test)
    const modulesRule = baseRule.oneOf('modules').resourceQuery(/module/)
    const normalRule = baseRule.oneOf('normal')

    applyLoaders(modulesRule, true)
    applyLoaders(normalRule, false)

    function applyLoaders(rule, modules) {
      const sourceMap = !isProd

      if (extract) {
        if (type === 'client') {
          rule
            .use('extract-loader')
            .loader(require('mini-css-extract-plugin').loader)
        }
      } else {
        rule.use('vue-style-loader').loader('vue-style-loader')
      }

      rule
        .use('css-loader')
        .loader('css-loader')
        .options({
          modules,
          sourceMap,
          localIdentName: `[local]_[hash:base64:8]`,
          importLoaders: 0 + Boolean(api.options.postcss) + Boolean(loader)
        })

      // Only use postcss-loader when a config file was found
      if (api.options.postcss) {
        rule
          .use('postcss-loader')
          .loader('postcss-loader')
          .options(
            Object.assign(
              {
                sourceMap: !isProd
              },
              api.options.postcss
            )
          )
      }

      if (loader) {
        rule
          .use(loader)
          .loader(loader)
          .options(
            Object.assign(
              {
                sourceMap
              },
              options
            )
          )
      }
    }
  }

  createCSSRule('css', /\.css$/)
  createCSSRule('scss', /\.scss$/, 'sass-loader')
  createCSSRule('sass', /\.sass$/, 'sass-loader', { indentedSyntax: true })
  createCSSRule('less', /\.less$/, 'less-loader')
  createCSSRule('stylus', /\.styl(us)?$/, 'stylus-loader', {
    preferPathResolver: 'webpack'
  })

  // prettier-ignore
  TimeFixPlugin.__expression = `require('time-fix-plugin')`
  config.plugin('timefix').use(TimeFixPlugin)

  config
    .plugin('watch-missing')
    .use(require('./plugins/WatchMissingNodeModulesPlugin'))

  if (
    api.options.progress !== false &&
    !api.options.debug &&
    !api.options.debugWebpack
  ) {
    const webpackbar = require('webpackbar')
    webpackbar.__expression = `require('webpackbar')`
    config.plugin('webpackbar').use(webpackbar, [
      {
        name: type,
        color: type === 'server' ? 'green' : 'magenta'
      }
    ])
  }

  config.plugin('report').use(
    class ReportPlugin {
      apply(compiler) {
        compiler.hooks.done.tap('report', stats => {
          if (stats.hasErrors() || stats.hasWarnings()) {
            console.log(
              stats.toString({
                colors: true,
                children: false,
                modules: false,
                assets: false
              })
            )
          }
        })
      }
    }
  )
}
