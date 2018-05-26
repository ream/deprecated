const env = process.env.BABEL_ENV || process.env.NODE_ENV

module.exports = (ctx, { isServer, defaultBabelPreset }) => {
  if (defaultBabelPreset === false) {
    return {}
  }

  const presets = [
    [
      require.resolve('@babel/preset-env'),
      {
        modules: env === 'test',
        targets:
          isServer || env === 'test'
            ? {
                node: 'current'
              }
            : {
                ie: 9
              }
      }
    ]
  ]

  if (defaultBabelPreset === 'minimal') {
    return {
      presets
    }
  }

  const plugins = [
    require.resolve('@babel/plugin-proposal-class-properties'),
    [
      require.resolve('@babel/plugin-transform-runtime'),
      {
        helpers: false,
        polyfill: false,
        regenerator: true
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
          return (
            'chunk-' +
            name
              .replace(/\.[a-z0-9]{2,5}$/, '')
              .replace(/[^a-z0-9]+/gi, '-')
              .toLowerCase()
          )
        }
      }
    ]
  ]

  return {
    presets,
    plugins
  }
}
