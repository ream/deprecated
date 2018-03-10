const path = require('path')
const webpack = require('webpack')
const applyCssRule = require('poi-webpack-utils/rules/css')
const applyVueRule = require('poi-webpack-utils/rules/vue')
const applyFontRule = require('poi-webpack-utils/rules/font')
const applyImageRule = require('poi-webpack-utils/rules/image')
const applyJsRule = require('poi-webpack-utils/rules/js')
const TimeFixPlugin = require('time-fix-plugin')
const getFileNames = require('poi-webpack-utils/helpers/getFileNames')
const { ownDir, inWorkspace } = require('../utils/dir')

const resolveModules = config => {
  const modules = [
    'node_modules',
    path.resolve('node_modules'),
    inWorkspace ? ownDir('../../node_modules') : ownDir('node_modules')
  ]
  config.set('resolve.modules', modules)
  config.set('resolveLoader.modules', modules)
}

module.exports = (api, config, isServer) => {
  const filename = getFileNames(!api.options.dev)

  config.set('resolve.alias.#app-entry', api.options.entry)

  config.set('performance', {
    hints: false
  })

  config.set('output', {
    filename: '[name].js',
    publicPath: '/_ream/',
    chunkFilename: filename.chunk
  })

  config.plugins.add('envs', webpack.DefinePlugin, [
    {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
      'process.server': isServer,
      'process.browser': !isServer,
      __DEV__: Boolean(api.options.dev)
    }
  ])

  resolveModules(config)

  const babelOptions = {
    presets: [
      [
        require.resolve('babel-preset-ream'),
        {
          isServer
        }
      ]
    ]
  }
  const cssOptions = {
    minimize: !api.options.dev && api.options.minimize !== false,
    extract: false,
    sourceMap: api.options.dev,
    fallbackLoader: 'vue-style-loader',
    postcss: api.options.postcss || { plugins: [] }
  }
  applyCssRule.standalone(config, cssOptions)
  applyVueRule(config, {
    babel: babelOptions,
    cssOptions,
    vueOptions: {
      preserveWhitespace: false
    }
  })
  applyFontRule(config, filename)
  applyImageRule(config, filename)

  applyJsRule(config, {
    babel: babelOptions
  })
  config.rules.update('js', options => {
    options.exclude = options.exclude || []
    options.exclude.push(
      // Exclude ream/app
      filepath => {
        return filepath.indexOf(ownDir('app')) > -1
      }
    )
    return options
  })
  // Build ream app dir
  config.rules
    .add('js-ream-app', {
      test: /\.js$/,
      include: [
        filepath => {
          return filepath.indexOf(ownDir('app')) > -1
        }
      ]
    })
    .loaders.add('babel-loader', {
      loader: require.resolve('babel-loader'),
      options: {
        babelrc: false,
        presets: [require.resolve('babel-preset-ream')]
      }
    })

  config.plugins.add('timefix', TimeFixPlugin)

  config.set(
    'optimization.minimize',
    typeof api.options.minimize === 'boolean'
      ? api.options.minimize
      : !api.options.dev
  )

  config.plugins.add(
    'watch-missing',
    require('./WatchMissingNodeModulesPlugin')
  )
}
