const path = require('path')
const webpack = require('webpack')
const TimeFixPlugin = require('time-fix-plugin')
const { ownDir, inWorkspace } = require('../utils/dir')

const resolveModules = config => {
  const modules = [
    'node_modules',
    path.resolve('node_modules'),
    inWorkspace ? ownDir('../../node_modules') : ownDir('node_modules')
  ]
  config.resolve.modules.merge(modules)
  config.resolveLoader.modules.merge(modules)
}

module.exports = (api, config, isServer) => {
  config.resolve.alias.set('#app-entry', api.options.entry)

  config.merge({
    mode: api.options.dev ? 'development' : 'production',
    performance: {
      hints: false
    },
    output: {
      filename: '[name].js',
      publicPath: '/_ream/'
    },
    optimization: {
      minimize: false
    }
  })

  // No need to minimize in server or dev mode
  if (!isServer && !api.options.dev && api.options.minimize !== false) {
    config.merge({
      optimization: {
        minimize: true,
        minimizer: [
          {
            apply(compiler) {
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
          }
        ]
      }
    })
  }

  // prettier-ignore
  webpack.DefinePlugin.__expression = 'webpack.DefinePlugin'
  config.plugin('constants').use(webpack.DefinePlugin, [
    {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
      'process.server': isServer,
      'process.browser': !isServer,
      __DEV__: Boolean(api.options.dev)
    }
  ])

  resolveModules(config)

  const babelOptions = {
    cacheDirectory: true,
    // babelrc: false,
    presets: [
      [
        require.resolve('babel-preset-ream'),
        {
          isServer
        }
      ]
    ]
  }

  // Build ream app dir
  // prettier-ignore
  config.module.rule('own-app')
    .test(/\.js$/)
    .include
      .add(filepath => {
        return filepath.startsWith(ownDir('app'))
      })
      .end()
    .use('babel-loader')
      .loader('babel-loader')
      .options(babelOptions)

  // prettier-ignore
  config.module.rule('js')
    .test(/\.js$/)
    .include
      .add(filepath => {
        return !/node_modules/.test(filepath)
      })
      .end()
    .use('babel-loader')
      .loader('babel-loader')
      .options(babelOptions)

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

  if (!isServer && isProd) {
    const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
    MiniCSSExtractPlugin.__expression = `require('mini-css-extract-plugin')`
    config.plugin('css-extract').use(MiniCSSExtractPlugin, [
      {
        filename: '_peco/assets/css/styles.[chunkhash:6].css'
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

      if (!isServer) {
        if (isProd) {
          rule
            .use('extract-css-loader')
            .loader(require('mini-css-extract-plugin').loader)
        } else {
          rule.use('vue-style-loader').loader('vue-style-loader')
        }
      }

      rule
        .use('css-loader')
        .loader(isServer ? 'css-loader/locals' : 'css-loader')
        .options({
          modules,
          sourceMap,
          localIdentName: `[local]_[hash:base64:8]`,
          importLoaders: 1,
          minimize: isProd
        })

      rule
        .use('postcss-loader')
        .loader('postcss-loader')
        .options(
          Object.assign(
            {
              sourceMap: !isProd
            },
            api.options.postcss || { plugins: [] }
          )
        )

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

  config.plugin('watch-missing').use(require('./WatchMissingNodeModulesPlugin'))

  if (
    api.options.progress !== false &&
    !api.options.debug &&
    !api.options.debugWebpack
  ) {
    const webpackbar = require('webpackbar')
    webpackbar.__expression = `require('webpackbar')`
    config.plugin('webpackbar').use(webpackbar, [
      {
        name: isServer ? 'server' : 'client',
        color: isServer ? 'green' : 'magenta'
      }
    ])
  }
}
