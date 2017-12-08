const path = require('path')

const env = process.env.BABEL_ENV || process.env.NODE_ENV

module.exports = () => {
  const presets = [
    env === 'test' ? [require('babel-preset-env').default, {
      targets: {
        node: 'current'
      }
    }] : [require('babel-preset-env').default, {
      useBuiltIns: true,
      modules: false,
      targets: {
        ie: 9,
        uglify: true
      }
    }],
    require.resolve('babel-preset-vue')
  ]

  const plugins = [
    [require.resolve('babel-plugin-transform-runtime'), {
      helpers: false,
      polyfill: false,
      regenerator: true,
      // Resolve the Babel runtime relative to the config.
      moduleName: path.dirname(require.resolve('babel-runtime/package'))
    }],
    [require.resolve('babel-plugin-transform-object-rest-spread'), {
      useBuiltIns: true
    }],
    // For dynamic import that you will use a lot in code-split
    require.resolve('babel-plugin-syntax-dynamic-import')
  ]

  return {
    presets,
    plugins
  }
}
