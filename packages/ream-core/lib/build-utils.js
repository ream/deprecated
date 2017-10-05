exports.getFilename = (useHash, customFileName) => {
  return Object.assign({
    js: useHash ? '[name].[chunkhash:8].js' : '[name].js',
    css: useHash ? '[name].[contenthash:8].css' : '[name].css',
    static: 'static/media/[name].[hash:8].[ext]',
    chunk: useHash ? '[name].[chunkhash:8].chunk.js' : '[name].chunk.js'
  }, customFileName)
}
