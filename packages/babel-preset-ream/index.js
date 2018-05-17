const path = require('path')

const env = process.env.BABEL_ENV || process.env.NODE_ENV

module.exports = ({ isServer } = {}) => {
  const presets = [
    (env === 'test' || isServer) ?
      [
        require('@babel/preset-env').default,
        {
          targets: {
            node: 'current'
          }
        }
      ] :
      [
        require('@babel/preset-env').default,
        {
          // Disable polyfill transforms
          // Error: Cannot assign to read only property 'exports' of object '#<Object>'
          // happens out of nowhere when we set it to 'usage'
          useBuiltIns: false,
          modules: false,
          targets: {
            ie: 9
          }
        }
      ]
  ]

  const plugins = [
    require.resolve('@babel/plugin-proposal-class-properties'),
    // Require.resolve('babel-macros'),
    [
      require.resolve('@babel/plugin-transform-runtime'),
      {
        helpers: false,
        polyfill: false,
        regenerator: true,
        // Resolve the Babel runtime relative to the config.
        moduleName: path.dirname(require.resolve('@babel/runtime/package'))
      }
    ],
    [
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      {
        useBuiltIns: true
      }
    ],
    // For dynamic import that you will use a lot in code-split
    require.resolve('@babel/plugin-syntax-dynamic-import'),
    require.resolve('babel-plugin-transform-vue-jsx'),
    [
      require.resolve('babel-plugin-webpack-chunkname'),
      {
        getChunkName(name) {
          return 'chunk-' + name
            .replace(/\.[a-z0-9]{2,5}$/, '')
            .replace(/[^a-z0-9]/gi, '-')
            .toLowerCase()
        }
      }
    ]
  ]

  return {
    presets,
    plugins
  }
}
