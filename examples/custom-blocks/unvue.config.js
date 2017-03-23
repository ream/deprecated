module.exports = {
  extendWebpack(config) {
    config
      .plugin('loaderOptions')
      .tap(args => {
        args[0].options.vue.loaders.blog = require.resolve('./blog-loader')
        return args
      })
  },
  generate: {
    routes: ['/']
  }
}
