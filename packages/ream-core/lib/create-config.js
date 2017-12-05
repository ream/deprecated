const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const Config = require('webpack-chain')
const nodeExternals = require('webpack-node-externals')
const HtmlPlugin = require('html-webpack-plugin')
const PostCompilePlugin = require('post-compile-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = (ctx, type) => {
  const config = new Config()

  const dist = `dist-${type}`
  const outputPath = path.join(ctx.buildOptions.output.path, dist)
  config.output
    .path(outputPath)
    .filename(ctx.buildOptions.output.filename.js)
    .publicPath('/_ream/')
    .chunkFilename(ctx.buildOptions.output.filename.chunk)

  config.performance.hints(false)

  config.node
    .set('fs', 'empty')
    .set('net', 'empty')
    .set('tls', 'empty')

  if (type === 'client') {
    config.entry('main')
      .add(ctx.ownDir('app/client-polyfills.js'))
  }

  config.entry('main')
    .add(path.join(ctx.renderer.appPath, `${type}.js`))

  config.resolve.alias
    .set('entry-of-user-app$', ctx.resolveCwd(ctx.buildOptions.entry))

  config.resolve.symlinks(true)

  config.resolve.modules
    .add('node_modules')
    .add(path.resolve('node_modules'))
    .add(ctx.ownDir('node_modules'))

  config.resolveLoader.modules
    .add('node_modules')
    .add(path.resolve('node_modules'))
    .add(ctx.ownDir('node_modules'))

  // Transform core app
  config.module.rule('ream-js')
    .test(/\.js$/)
    .include
      .add(ctx.ownDir('app'))

  // Transform user app
  config.module.rule('js')
    .test(/\.js$/)
    .include
      .add(filepath => {
        if (
          filepath.indexOf(ctx.renderer.appPath) >= 0 ||
          filepath.indexOf(ctx.ownDir('app')) >= 0
        ) {
          return true
        }

        if (/node_modules/.test(filepath)) {
          return false
        }

        return true
      })
      .end()
    .use('babel-loader')
      .loader('babel-loader')
      .options({
        presets: [
          [require.resolve('babel-preset-ream'), {
            jsx: ctx.buildOptions.jsx
          }]
        ]
      })

  config.module
    .rule('image')
      .test([/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/])
      .use('url-loader')
        .loader('url-loader')
        .options({
          name: ctx.buildOptions.output.filename.images,
          // inline the file if < max size (hard-coded 10kb)
          limit: 10000
        })
        .end()
      .end()
    // SVG files use file-loader directly, why?
    // See https://github.com/facebookincubator/create-react-app/pull/1180
    .rule('svg')
      .test(/\.(svg)(\?.*)?$/)
      .use('file-loader')
        .loader('file-loader')
        .options({
          name: ctx.buildOptions.output.filename.images
        })
        .end()
      .end()
    .rule('font')
      .test(/\.(eot|otf|webp|ttf|woff|woff2)(\?.*)?$/)
      .use('file-loader')
        .loader('file-loader')
        .options({
          name: ctx.buildOptions.output.filename.fonts
        })

  config.plugin('constants')
    .use(webpack.DefinePlugin, [{
      'process.env.NODE_ENV': JSON.stringify(ctx.dev ? 'development' : 'production'),
      'process.isServer': JSON.stringify(type === 'server'),
      'process.isBrowser': JSON.stringify(type === 'client')
    }])

  const logStats = stats => {
    const statsOption = {
      children: false,
      chunks: false,
      modules: false,
      colors: true,
      hash: false,
      version: false
    }
    console.log(stats.toString(statsOption))

    if (ctx.dev && type === 'client' && ctx.host && ctx.port) {
      console.log(`> Open http://${ctx.host}:${ctx.port}`)
    }
  }

  config.plugin('report-stats')
    .use(PostCompilePlugin, [logStats])

  if (type === 'server') {
    config.devtool(ctx.dev ? 'source-map' : false)
    config.target('node')

    config.output.libraryTarget('commonjs2')

    config.externals([
      nodeExternals({
        whitelist: [/\.(?!(?:js|json)$).{1,5}$/i]
      })
    ])
  }

  if (type === 'client') {
    config.devtool(ctx.dev ? 'eval-source-map' : 'source-map')

    const staticFolder = ctx.resolveCwd(ctx.buildOptions.staticFolder)
    if (fs.existsSync(staticFolder)) {
      config.plugin('copy-static')
        .use(CopyPlugin, [[{
          from: staticFolder,
          to: 'static'
        }]])
    }

    config.plugin('html')
      .use(HtmlPlugin, [{}])

    config.plugin('commons')
      .use(webpack.optimize.CommonsChunkPlugin, [{
        name: 'commons',
        filename: 'commons.js',
        minChunks(module, count) {
          if (ctx.dev) {
            return module.context && module.context.indexOf('node_modules') >= 0
          }

          return count > 2
        }
      }])

    config.plugin('commons-manifest')
      .use(webpack.optimize.CommonsChunkPlugin, [{
        name: 'manifest'
      }])

    if (ctx.dev) {
      config.entry('main')
        .prepend(ctx.ownDir('app/dev-client.js'))

      config.plugin('hmr')
        .use(webpack.HotModuleReplacementPlugin)
    }
  }

  if (!ctx.dev) {
    // Do not tend to continue bundling when there's error
    config.bail(true)

    if (type === 'client') {
      const ProgressPlugin = require('webpack/lib/ProgressPlugin')

      config.plugin('progress')
        .use(ProgressPlugin)

      if (ctx.buildOptions.bundleReport) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

        config.plugin('bundle-report')
          .use(BundleAnalyzerPlugin)
      }
    }

    config.plugin('uglifyjs')
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
  }

  return config
}
