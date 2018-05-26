const webpack = require('webpack')

module.exports = api => {
  const { serverCompiler, clientCompiler } = api.createCompilers()

  require('webpack-hot-client')(clientCompiler, {
    logLevel: 'error'
  })

  const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    publicPath: clientCompiler.options.output.publicPath,
    logLevel: 'silent'
  })

  let clientManifest
  let serverBundle

  const notify = () => {
    if (clientManifest && serverBundle) {
      api.createRenderer({
        clientManifest,
        serverBundle,
        serverType: 'dev'
      })
    }
  }

  const mfs = new webpack.MemoryOutputFileSystem()
  serverCompiler.outputFileSystem = mfs
  serverCompiler.watch({}, err => {
    if (err) console.error(err)
    serverBundle = JSON.parse(
      mfs.readFileSync(api.resolveDist('server/server-bundle.json'), 'utf8')
    )
    notify()
  })

  clientCompiler.plugin('done', stats => {
    if (!stats.hasErrors()) {
      clientManifest = JSON.parse(
        clientCompiler.outputFileSystem.readFileSync(
          api.resolveDist('client/client-manifest.json'),
          'utf8'
        )
      )
      notify()
    }
  })

  return server => {
    server.use(devMiddleware)
  }
}
