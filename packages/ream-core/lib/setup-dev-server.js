
const path = require('path')
const webpack = require('webpack')
const express = require('express')
const MFS = require('memory-fs')

module.exports = function (ctx) {
  const devServer = express()

  const serverConfig = ctx.serverConfig.toConfig()
  const clientConfig = ctx.clientConfig.toConfig()
  const { host, port } = ctx.devServerOptions

  // Dev middleware
  let clientCompiler
  let serverCompiler
  try {
    clientCompiler = webpack(clientConfig)
    serverCompiler = webpack(serverConfig)
  } catch (err) {
    if (err.name === 'WebpackOptionsValidationError') {
      console.log(err.message)
    } else {
      console.error(err)
    }
    process.exit(1) // eslint-disable-line unicorn/no-process-exit
  }

  const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
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
