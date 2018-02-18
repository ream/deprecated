const fs = require('fs')
const webpack = require('webpack')
const chokidar = require('chokidar')

module.exports = api => {
  const { serverCompiler, clientCompiler } = api.createCompilers()

  const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    publicPath: clientCompiler.options.output.publicPath,
    logLevel: 'silent'
  })

  const hotMiddleware = require('webpack-hot-middleware')(clientCompiler, {
    log: () => {},
    path: '/_ream/__hmr'
  })

  let clientManifest
  let serverBundle
  let template = fs.readFileSync(api.options.html, 'utf8')

  const notify = () => {
    if (clientManifest && serverBundle && template) {
      api.createRenderer({
        clientManifest,
        serverBundle,
        template,
        serverType: 'dev'
      })
    }
  }

  chokidar.watch(api.options.html).on('change', () => {
    template = fs.readFileSync(api.options.html, 'utf8')
    notify()
  })

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
    server.use(hotMiddleware)
  }
}
