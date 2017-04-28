module.exports = {
  generate: {
    routes: {
      '/': true,
      '/foo.html': true
    }
  },
  extendWebpack(config) {
    config.module
      .rule('markdown')
        .test(/\.md$/)
        .use('vue-markdown')
          .loader('vue-markdown-loader')
          .end()
        .end()
  }
}
