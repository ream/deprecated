const path = require('path')
const url = require('url')
const EventEmitter = require('events')
const fs = require('fs-promise')
const express = require('express')
const rm = require('rimraf')
const chalk = require('chalk')
const serialize = require('serialize-javascript')
const getPort = require('get-port')
const ip = require('internal-ip')
const pathToRegexp = require('path-to-regexp')
const finalhandler = require('finalhandler')
const Router = require('./router')
const { promisify, isType } = require('./utils')
const createConfig = require('./create-config')

function createRenderer(bundle, options) {
  return require('vue-server-renderer').createBundleRenderer(bundle, Object.assign({
    runInNewContext: false,
    cache: require('lru-cache')({
      max: 1000,
      maxAge: 1000 * 60 * 15
    })
  }, options))
}

function renderTemplate(template, context) {
  const {
    title, link, style, script, noscript, meta
  } = context.meta.inject()

  let [start, end] = template.split('<!--ream-app-placeholder-->')

  start = start
    .replace('<!--ream-head-placeholder-->', `${meta.text()}
      ${title.text()}
      ${link.text()}
      ${style.text()}
      ${script.text()}
      ${noscript.text()}`)
    .replace('<!--ream-styles-placeholder-->', context.renderStyles() || '')
    .replace('<!--ream-hints-placeholder-->', context.renderResourceHints())

  end = `<script>window.__REAM__=${serialize({
    state: context.state,
    data: context.data
  }, { isJSON: true })}</script>` + end.replace('<!--ream-scripts-placeholder-->', context.renderScripts())

  return {
    start,
    end
  }
}

const serveStatic = (path, cache) => express.static(path, {
  maxAge: cache ? '1d' : 0
})

class Ream extends EventEmitter {
  constructor(options = {}) {
    super()

    this.options = {
      cwd: options.cwd || process.cwd(),
      extendWebpack: options.extendWebpack,
      html: options.html,
      entry: options.entry,
      babel: options.babel,
      postcss: options.postcss,
      plugins: options.plugins || [],
      externalsWhitelist: options.externalsWhitelist || [],
      outputFolder: options.outputFolder || '.ream'
    }

    this.dev = options.dev

    this.webpackConfig = {}
    this.generateRoutes = []
  }

  setWebpackConfig(options) {
    const clientConfig = createConfig(Object.assign({}, this.options, options, {
      type: 'client',
      dev: this.dev
    }))

    const serverConfig = createConfig(Object.assign({}, this.options, options, {
      type: 'server',
      dev: this.dev
    }))

    const context = {
      dev: this.dev,
      options: this.options,
      // This is actually a mistake, it should be `extendWebpack`
      // To make it backward compat, will not remove it until v1.0
      extendConfig(cb) {
        cb(clientConfig, { type: 'client' })
        cb(serverConfig, { type: 'server' })
      },
      extendWebpack(cb) {
        cb(clientConfig, { type: 'client' })
        cb(serverConfig, { type: 'server' })
      },
      addGenerateRoutes: routes => {
        this.generateRoutes = this.generateRoutes.concat(routes)
      }
    }

    return Promise.all(this.options.plugins.map(plugin => {
      return plugin(context)
    })).then(() => {
      this.webpackConfig = {
        client: clientConfig.toConfig(),
        server: serverConfig.toConfig()
      }
    })
  }

  handleCompiled(type) {
    return payload => {
      this.stats[type] = payload.stats
      if (payload.bundle) {
        this.renderer = createRenderer(payload.bundle, {
          clientManifest: payload.clientManifest
        })
      }
      if (payload.template) {
        this.template = payload.template
      }
      if (this.stats.client && this.stats.server) {
        this.emit('ready')
      }
    }
  }

  prepare() {
    const pipe = Promise.resolve()

    if (this.dev) {
      this.stats = {}
      this.on('compiled-server', this.handleCompiled('server'))
      this.on('compiled-client', this.handleCompiled('client'))

      return pipe
        .then(() => getPort())
        .then(port => {
          const host = ip.v4()
          this.devServerHost = host
          this.devServerPort = port
          return this.setWebpackConfig()
            .then(() => ({ port, host }))
        })
        .then(devServerOptions => {
          require('./setup-dev-server')(this, devServerOptions)
        })
    }

    const bundle = require(this.getCwd(this.options.outputFolder, 'dist/vue-ssr-server-bundle.json'))
    const clientManifest = require(this.getCwd(this.options.outputFolder, 'dist/vue-ssr-client-manifest.json'))
    this.template = fs.readFileSync(this.getCwd(this.options.outputFolder, 'dist/index.html'), 'utf-8')
    this.renderer = createRenderer(bundle, {
      clientManifest
    })
    return pipe.then(() => {
      this.emit('ready')
    })
  }

  getCwd(...args) {
    return path.resolve(this.options.cwd, ...args)
  }

  build(options) {
    return this.setWebpackConfig(options)
      .then(() => {
        return require('./build')(this.webpackConfig).then(([clientStats, serverstats]) => {
          this.stats = {
            client: clientStats,
            server: serverstats
          }
        })
      })
  }

  generate({
    routes = [],
    homepage = '/'
  } = {}) {
    const parseRoutes = routes => {
      if (isType(routes, 'Object')) {
        return Object.keys(routes).map(route => {
          if (routes[route] === true) return [route]

          const patterns = Array.isArray(routes[route]) ? routes[route] : [routes[route]]

          return patterns.map(pattern => {
            const toPath = pathToRegexp.compile(route)
            return toPath(pattern)
          })
        }).reduce((curr, next) => {
          return curr.concat(next)
        }, [])
      }

      return routes
    }

    const handleUrl = url => {
      if (/\.html$/.test(url)) {
        return url
      }

      if (/\/$/.test(url)) {
        return `${url}index.html`
      }

      return `${url}/index.html`
    }

    const g = () => Promise.all(parseRoutes(routes)
      .concat(parseRoutes(this.generateRoutes))
      .map(url => {
        const context = { url, data: {}, dev: this.dev }

        return promisify(this.renderer.renderToString)(context)
        .then(main => {
          const { start, end } = renderTemplate(this.template, context)
          return start + main + end
        })
        .then(html => {
          const file = this.getCwd(this.options.outputFolder, 'dist' + handleUrl(url))
          return fs.ensureDir(path.dirname(file))
            .then(() => {
              return fs.writeFile(file, html, 'utf8')
            })
        })
      }))

    return this.build({ homepage })
      .then(() => this.prepare())
      .then(() => g())
      .then(() => {
        rm.sync(this.getCwd(this.options.outputFolder, 'dist', 'vue-ssr-bundle.json'))
        return this.getCwd(this.options.outputFolder, 'dist')
      })
  }

  getRequestHandler() {
    const router = new Router()

    const serverInfo = `ream/${require('../package.json').version}`

    const proxyDevServer = (req, res) => {
      require('http-proxy').createProxyServer({
        target: `http://${this.devServerHost}:${this.devServerPort}`
      }).web(req, res)
    }

    const routes = []

    if (this.dev) {
      routes['/__webpack_hmr'] = proxyDevServer
    }

    routes['/favicon.ico'] = (req, res) => {
      res.statucCode = 404
      res.end('404')
    }

    routes['/_ream/*'] = (req, res) => {
      if (this.dev) {
        return proxyDevServer(req, res)
      }
      req.url = req.url.replace(/^\/_ream/, '')
      serveStatic(this.getCwd(this.options.outputFolder, 'dist'), !this.dev)(req, res, finalhandler(req, res))
    }

    routes['/public/*'] = (req, res) => {
      req.url = req.url.replace(/^\/public/, '')
      serveStatic(this.getCwd('public'), !this.dev)(req, res, finalhandler(req, res))
    }

    routes['*'] = (req, res) => {
      if (!this.renderer || !this.template) {
        return res.end('waiting for compilation... refresh in a moment.')
      }

      const s = Date.now()

      res.setHeader('Content-Type', 'text/html')
      res.setHeader('Server', serverInfo)

      const errorHandler = err => {
        if (err && err.code === 404) {
          res.statusCode = 404
          res.end('404 | Page Not Found')
        } else {
          // Render Error Page or Redirect
          res.statucCode = 500
          res.end('500 | Internal Server Error')
          console.error(`error during render : ${req.url}`)
          console.error(err)
        }
      }

      const context = { url: req.url, data: {}, dev: this.dev }

      const renderStream = this.renderer.renderToStream(context)

      let splitContent

      renderStream.once('data', () => {
        splitContent = renderTemplate(this.template, context)
        res.write(splitContent.start)
      })

      renderStream.on('data', chunk => {
        res.write(chunk)
      })

      renderStream.on('end', () => {
        res.end(splitContent.end)
        console.log(`> Whole request: ${Date.now() - s}ms`)
      })

      renderStream.on('error', errorHandler)
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

module.exports = options => new Ream(options)

module.exports.displayStats = function (stats = {}) {
  if (!stats.server && !stats.client) return

  process.stdout.write('\u001Bc')

  // If one of the compilations errors
  // print error and stop
  const anyStats = stats.server || stats.client
  if (anyStats.hasErrors() || anyStats.hasWarnings()) {
    if (anyStats.hasErrors()) {
      console.log(anyStats.toString('errors-only'))
      console.log(`\n${chalk.bgRed.black(' ERROR ')} Compiled with errors!\n`)
      process.exitCode = 1
    } else if (anyStats.hasWarnings()) {
      console.log(anyStats.toString('errors-only'))
      console.log(`\n${chalk.bgYellow.black(' WARN ')} Compiled with warning!\n`)
      process.exitCode = 0
    }
    return
  }

  // Compiled successfully
  // print client assets
  const statsOption = {
    children: false,
    chunks: false,
    modules: false,
    colors: true,
    hash: false,
    version: false
  }

  if (stats.client) {
    console.log(chalk.cyan(`> Client stats:`))
    console.log(stats.client.toString(statsOption))
  }

  if (stats.server) {
    console.log(chalk.cyan(`\n> Server stats:`))
    console.log(stats.server.toString(statsOption))
  }

  console.log(`\n${chalk.bgGreen.black(' SUCCESS ')} Compiled successfully!\n`)
}
