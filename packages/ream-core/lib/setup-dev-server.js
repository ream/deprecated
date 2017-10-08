
const express = require('express')
const MFS = require('memory-fs')

module.exports = function (ctx) {
  const devServer = express()

  const { serverCompiler, clientCompiler } = ctx
  const { host, port } = ctx.devServerOptions

  // Dev middleware
  const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    publicPath: clientCompiler.options.output.publicPath,
    quiet: true
  })
  devServer.use(devMiddleware)

  // Hot middleware
  devServer.use(require('webpack-hot-middleware')(clientCompiler, {
    log: () => {}
  }))

  const mfs = new MFS()
  serverCompiler.outputFileSystem = mfs
  serverCompiler.watch({}, err => {
    if (err) console.error(err)
  })

  devServer.listen(port, host)
}
