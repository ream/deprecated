module.exports = {
  extendWebpack(config) {
    config.module.rule('vue')
      .use('vue')
      .tap(options => {
        options.loaders.blog = require.resolve('./blog-loader')
        return options
      })
  },
  generate: {
    routes: ['/']
  }
}
