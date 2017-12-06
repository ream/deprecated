const path = require('path')
const url = require('url')
const express = require('express')
const fs = require('fs-extra')
const globby = require('globby')
const finalhandler = require('finalhandler')
const createConfig = require('./create-config')
const runWebpack = require('./run-webpack')
const Router = require('./router')
const { handleRoute, parseRoutes } = require('./utils')
const { getFilename } = require('./build-utils')

const serveStatic = (path, cache) => express.static(path, {
  maxAge: cache ? '1d' : 0,
  dotfiles: 'allow'
})

module.exports = class Ream {
  constructor({
    entry = 'src/index.js',
    renderer,
    output = {},
    dev,
    cwd = process.cwd(),
    host,
    port,
    extendWebpack,
    build = {},
    plugins = []
  } = {}) {
    if (!renderer) {
      throw new Error('Requires a renderer to start Ream.')
    }

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
      bundleReport: build.bundleReport,
      jsx: build.jsx || 'vue',
      staticFolder: build.staticFolder || 'static'
    }
    this.renderer = renderer
    this.serverConfig = createConfig(this, 'server')
    this.clientConfig = createConfig(this, 'client')
    this.plugins = plugins
    this.predefinedRoutes = []

    this.renderer.rendererInit(this)
    if (typeof extendWebpack === 'function') {
      this.extendWebpack(extendWebpack)
    }
  }

  addPredefinedRoutes(routes = []) {
    this.predefinedRoutes = this.predefinedRoutes.concat(routes)
    return this
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
    const serverConfig = this.serverConfig.toConfig()
    const clientConfig = this.clientConfig.toConfig()
    return Promise.all([
      fs.remove(serverConfig.output.path).then(() => runWebpack(serverConfig)),
      fs.remove(clientConfig.output.path).then(() => runWebpack(clientConfig))
    ])
  }

  generate({ routes = [], folder = 'generated' } = {}) {
    routes = [...new Set(this.predefinedRoutes.concat(routes))]
    if (route.length === 0) return Promise.reject(new Error('Expected to provide routes!'))
    const folderPath = this.resolveCwd(this.buildOptions.output.path, folder)
    return fs.remove(folderPath).then(() => Promise.all(parseRoutes(routes).map(route => {
      return this.renderer.renderToString(route)
        .then(html => {
          const outputPath = this.resolveCwd(
            folderPath,
            `.${handleRoute(route)}`
          )
          return fs.ensureDir(path.dirname(outputPath))
            .then(() => fs.writeFile(outputPath, html, 'utf8'))
        })
    })).then(() => {
      const distStaticPath = this.resolveDist('client', 'static')
      return Promise.all([
        fs.copy(
          this.resolveDist('client'),
          this.resolveCwd(folderPath, '_ream')
        ),
        fs.pathExists(distStaticPath)
          .then(exists => {
            if (!exists) return
            return fs.copy(distStaticPath, this.resolveCwd(folderPath))
          })
      ])
      .then(() => fs.remove(this.resolveCwd(folderPath, '_ream', 'index.html'))).then(() => folderPath)
    }))
  }

  async prepare() {
    await Promise.all(this.plugins.map(plugin => plugin(this)))
    this.staticFilePaths = await globby(['**'], { cwd: this.resolveCwd('static') })
    this.renderer.rendererPrepareRequests()
    if (this.dev) {
      this.webpackMiddleware = require('./setup-dev-server')(this)
    }
    return this
  }

  getRequestHandler() {
    const router = new Router()

    const serverInfo = `ream/${require('../package.json').version}`

    const routes = {}

    routes['/_ream/*'] = (req, res) => {
      if (this.dev) {
        return this.webpackMiddleware(req, res)
      }

      req.url = req.url.replace(/^\/_ream/, '')

      serveStatic(this.resolveCwd(this.buildOptions.output.path, 'dist-client'), !this.dev)(req, res, finalhandler(req, res))
    }

    routes['/public/*'] = (req, res) => {
      req.url = req.url.replace(/^\/public/, '')
      serveStatic(this.resolveCwd('public'), !this.dev)(req, res, finalhandler(req, res))
    }

    routes['/:path*'] = (req, res) => {
      const render = () => {
        res.setHeader('Content-Type', 'text/html')
        res.setHeader('Server', serverInfo)
        this.renderer.rendererHandleRequests(req, res)
      }

      const r = req.path.slice(1)
      const inStatic = this.staticFilePaths.some(filepath => {
        return r.startsWith(filepath)
      })
      if (inStatic) {
        return serveStatic(this.resolveCwd('static'), !this.dev)(req, res, () => {
          res.statusCode = 404
          res.end('404')
        })
      }
      render()
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
