
const webpack = require('webpack')
const MFS = require('memory-fs')

module.exports = function (ctx) {
  const serverConfig = ctx.serverConfig.toConfig()
  const clientConfig = ctx.clientConfig.toConfig()

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

  const hotMiddleware = require('webpack-hot-middleware')(clientCompiler, {
    log: () => {},
    path: '/_ream/__hmr'
  })

  const mfs = new MFS()
  serverCompiler.outputFileSystem = mfs
  serverCompiler.watch({}, err => {
    if (err) console.error(err)
  })

  return (req, res) => {
    devMiddleware(req, res, () => {})
    hotMiddleware(req, res, () => {})
  }
}
