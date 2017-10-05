const path = require('path')
const url = require('url')
const express = require('express')
const fs = require('fs-extra')
const finalhandler = require('finalhandler')
const createConfig = require('./create-config')
const runWebpack = require('./run-webpack')
const Router = require('./router')
const { handleRoute, parseRoutes } = require('./utils')
const { getFilename } = require('./build-utils')

const serveStatic = (path, cache) => express.static(path, {
  maxAge: cache ? '1d' : 0
})

module.exports = class Ream {
  constructor({
    entry = 'src/index.js',
    renderer,
    output = {},
    dev,
    cwd = process.cwd(),
    devServer,
    bundleReport,
    host,
    port,
    jsx = 'vue',
    extendWebpack
  } = {}) {
    this.dev = dev
    this.cwd = cwd
    this.host = host
    this.port = port
    this.buildOptions = {
      entry,
      output: Object.assign({
        path: path.resolve('.ream')
      }, output, {
        filename: getFilename(!this.dev, output.filename)
      }),
      bundleReport,
      jsx
    }
    this.devServerOptions = Object.assign({
      host: '0.0.0.0',
      port: 34592
    }, devServer)
    this.renderer = renderer
    this.serverConfig = createConfig(this, 'server')
    this.clientConfig = createConfig(this, 'client')

    this.renderer.rendererInit(this)
    if (typeof extendWebpack === 'function') {
      this.extendWebpack(extendWebpack)
    }
  }

  extendWebpack(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('Expected the first argument of extendWebpack to be a function')
    }
    fn(this.serverConfig, { type: 'server', dev: this.dev })
    fn(this.clientConfig, { type: 'client', dev: this.dev })
    return this
  }

  ownDir(...args) {
    return path.join(__dirname, '../', ...args)
  }

  resolveCwd(...args) {
    return path.resolve(this.cwd, ...args)
  }

  resolveDist(type, ...args) {
    return this.resolveCwd(this.buildOptions.output.path, `dist-${type}`, ...args)
  }

  build() {
    return Promise.all([
      runWebpack(this.serverConfig.toConfig()),
      runWebpack(this.clientConfig.toConfig())
    ])
  }

  generate({ routes, folder = 'generated' } = {}) {
    if (!routes) return Promise.reject(new Error('Expected to provide routes!'))
    const folderPath = this.resolveCwd(this.buildOptions.output.path, folder)
    return Promise.all(parseRoutes(routes).map(route => {
      return this.renderer.renderToString(route)
        .then(html => {
          const outputPath = this.resolveCwd(
            folderPath,
            `.${handleRoute(route)}`
          )
          console.log(folderPath, '***', `.${handleRoute(route)}`)
          return fs.ensureDir(path.dirname(outputPath))
            .then(() => fs.writeFile(outputPath, html, 'utf8'))
        })
    })).then(() => {
      return fs.copy(
        this.resolveDist('client'),
        this.resolveCwd(folderPath, '_ream')
      ).then(() => fs.remove(this.resolveCwd(folderPath, '_ream', 'index.html'))).then(() => folderPath)
    })
  }

  prepare() {
    this.renderer.rendererPrepareRequests()
    if (this.dev) {
      require('./setup-dev-server')(this)
    }
    return this
  }

  getRequestHandler() {
    const router = new Router()

    const serverInfo = `ream/${require('../package.json').version}`

    const proxyDevServer = (req, res) => {
      require('http-proxy').createProxyServer({
        target: `http://${this.devServerOptions.host}:${this.devServerOptions.port}`
      }).web(req, res)
    }

    const routes = {}

    if (this.dev) {
      routes['/__webpack_hmr'] = proxyDevServer
    }

    routes['/_ream/*'] = (req, res) => {
      if (this.dev) {
        return proxyDevServer(req, res)
      }

      req.url = req.url.replace(/^\/_ream/, '')

      serveStatic(this.resolveCwd(this.buildOptions.output.path, 'dist-client'), !this.dev)(req, res, finalhandler(req, res))
    }

    routes['/public/*'] = (req, res) => {
      req.url = req.url.replace(/^\/public/, '')
      serveStatic(this.resolvePath('public'), !this.dev)(req, res, finalhandler(req, res))
    }

    routes['/:path*'] = (req, res) => {
      res.setHeader('Content-Type', 'text/html')
      res.setHeader('Server', serverInfo)
      this.renderer.rendererHandleRequests(req, res)
    }

    for (const method of ['GET', 'HEAD']) {
      for (const p of Object.keys(routes)) {
        router.add(method, p, routes[p])
      }
    }

    return (req, res) => {
      router.match(req, res, url.parse(req.url, true))
    }
  }
}
