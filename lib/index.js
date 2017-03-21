const fs = require('fs')
const path = require('path')
const url = require('url')
const EventEmitter = require('events')
const express = require('express')
const chalk = require('chalk')
const serialize = require('serialize-javascript')
const Router = require('./router')

function createRenderer(bundle, template) {
  return require('vue-server-renderer').createBundleRenderer(bundle, {
    template,
    cache: require('lru-cache')({
      max: 1000,
      maxAge: 1000 * 60 * 15
    })
  })
}

const serveStatic = (path, cache) => express.static(path, {
  maxAge: cache ? '1d' : 0
})

class UNVUE extends EventEmitter {
  constructor(options = {}) {
    super()

    this.options = {
      cwd: options.cwd || process.cwd(),
      extendWebpack: options.extendWebpack,
      html: options.html
    }

    this.dev = options.dev
    process.env.NODE_ENV = this.dev ? 'development' : 'production'

    this.preFetchCache = require('lru-cache')(Object.assign({
      max: 1000,
      maxAge: 1000 * 60 * 15
    }, options.preFetchCache))
  }

  handleCompiled(type) {
    return payload => {
      this.stats[type] = payload.stats
      this.template = payload.template
      if (!this.renderer) {
        this.renderer = createRenderer(payload.bundle)
      }
      this.emit('valid')
    }
  }

  prepare() {
    if (this.dev) {
      this.stats = {}
      this.on('compiled:server', this.handleCompiled('server'))
      this.on('compiled:client', this.handleCompiled('client'))
      return require('./setup-dev-server')(this)
    }
    const bundle = require(this.getCwd('./dist/vue-ssr-bundle.json'))
    this.template = fs.readFileSync(this.getCwd('./dist/index.html'), 'utf-8')
    this.renderer = createRenderer(bundle)
    this.emit('valid')
    return Promise.resolve()
  }

  getCwd(...args) {
    return path.resolve(this.options.cwd, ...args)
  }

  build() {
    return require('./build')(this.options).then(([clientStats, serverstats]) => {
      this.stats = {
        client: clientStats,
        server: serverstats
      }
      this.emit('valid')
    })
  }

  getRequestHandler() {
    const router = new Router()

    const serverInfo = `unvue/${require('../package.json').version}`

    const routes = {
      '/dist/*': (req, res, next) => {
        if (this.dev) return next()
        serveStatic(this.getCwd(), !this.dev)(req, res, next)
      },
      '*': (req, res) => {
        if (!this.renderer) {
          return res.end('waiting for compilation... refresh in a moment.')
        }

        const s = Date.now()

        res.setHeader('Content-Type', 'text/html')
        res.setHeader('Server', serverInfo)

        const errorHandler = err => {
          if (err && err.code === 404) {
            res.status(404).end('404 | Page Not Found')
          } else {
            // Render Error Page or Redirect
            res.status(500).end('500 | Internal Server Error')
            console.error(`error during render : ${req.url}`)
            console.error(err)
          }
        }

        const context = { url: req.url, preFetchCache: this.preFetchCache }

        const renderStream = this.renderer.renderToStream(context)

        const [start, end] = this.template.split('<!--unvue-app-placeholder-->')

        renderStream.once('data', () => {
          const {
            title, link, style, script, noscript, meta
          } = context.meta.inject()

          res.write(
            start
              .replace('<!--unvue-head-placeholder-->', `${meta.text()}
                ${title.text()}
                ${link.text()}
                ${style.text()}
                ${script.text()}
                ${noscript.text()}`)
              .replace('<!--unvue-styles-placeholder-->', context.styles || '')
          )
        })

        renderStream.on('data', chunk => {
          res.write(chunk)
        })

        renderStream.on('end', () => {
          res.write(`<script>window.__INITIAL_STATE__=${serialize(context.state, { isJSON: true })}</script>`)
          res.end(end)
          console.log(`> Whole request: ${Date.now() - s}ms`)
        })

        renderStream.on('error', errorHandler)
      }
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

module.exports = function (options) {
  return new UNVUE(options)
}

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
    colors: true
  }

  if (stats.client) {
    console.log(stats.client.toString(statsOption))
    console.log(`\n${chalk.bgGreen.black(' SUCCESS ')} Compiled successfully!\n`)
  }
}
