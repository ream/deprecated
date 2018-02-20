const path = require('path')
const Event = require('events')
const fs = require('fs-extra')
const Conpack = require('conpack')
const polka = require('polka')
const chalk = require('chalk')
const merge = require('lodash.merge')
const { createBundleRenderer } = require('vue-server-renderer')
const UseConfig = require('use-config')
const basePlugin = require('./plugins/base')
const logger = require('./logger')
const serveStatic = require('./utils/serveStatic')
const renderTemplate = require('./utils/renderTemplate')
const { ownDir } = require('./utils/dir')
const emoji = require('./emoji')
const inspect = require('./utils/inspect')

const runWebpack = compiler => {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err)
      resolve(stats)
    })
  })
}

class Ream extends Event {
  constructor(options = {}) {
    super()
    // Init logger options
    logger.setOptions(options)

    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = options.dev ? 'development' : 'production'
    }

    // Load ream config
    const useConfig = new UseConfig({
      files: ['{name}.config.js', 'package.json'],
      name: 'ream'
    })
    const { path: configPath, config } = useConfig.loadSync()
    if (configPath) {
      logger.debug('ream config', configPath)
    }

    // Init options
    this.options = merge(
      {
        entry: 'index.js',
        html: ownDir('app/index.template.html'),
        plugins: [],
        server: {
          host: '0.0.0.0',
          port: 4000
        },
        generate: {
          routes: ['/']
        }
      },
      config,
      options
    )
    this.options.entry = path.resolve(this.options.entry)
    this.options.rootPublicFiles = [
      ...new Set(
        ['favicon.ico', 'CNAME', '.nojekyll', '.well-known'].concat(
          this.options.rootPublicFiles || []
        )
      )
    ]
    logger.debug('ream options', inspect(this.options))

    this.serverConpack = new Conpack()
    this.clientConpack = new Conpack()
    this.extendWebpackFns = []
    this.loadPlugins()

    this.on('renderer-ready', type => {
      if (type === 'generate') return

      logger.log(
        `\n  App running at:\n\n  - Local: ${chalk.bold(
          `http://localhost:${this.options.server.port}`
        )}\n`
      )
    })
  }

  extendWebpack(fn) {
    this.extendWebpackFns.push(fn)
  }

  runExtendWebpackFns() {
    for (const fn of this.extendWebpackFns) {
      fn(this.serverConpack, {
        type: 'server',
        isServer: true,
        isClient: false,
        dev: this.options.dev
      })
      fn(this.clientConpack, {
        type: 'client',
        isServer: false,
        isClient: true,
        dev: this.options.dev
      })
    }
  }

  loadPlugins() {
    const plugins = [basePlugin].concat(this.options.plugins)
    plugins.forEach(plugin => plugin(this))
  }

  createCompilers() {
    const serverConfig = this.serverConpack.toConfig()

    logger.debug('server config', inspect(serverConfig))
    const serverCompiler = require('webpack')(serverConfig)

    const clientConfig = this.clientConpack.toConfig()
    logger.debug('client config', inspect(clientConfig))
    const clientCompiler = require('webpack')(clientConfig)

    return {
      serverCompiler,
      clientCompiler
    }
  }

  async build() {
    await fs.remove(this.resolveDist())
    this.runExtendWebpackFns()

    const { serverCompiler, clientCompiler } = this.createCompilers()
    return Promise.all([runWebpack(serverCompiler), runWebpack(clientCompiler)])
  }

  async generate({ routes } = this.options.generate) {
    // Not an actually server
    // Don't emit `server-ready` event
    this.prepareProduction({ serverType: 'generate' })
    // Copy assets to `generated`
    await Promise.all([
      fs.copy(this.resolveDist('client'), this.resolveDist('generated/_ream')),
      fs
        .pathExists(path.resolve('public'))
        .then(
          exists =>
            exists &&
            fs.copy(
              path.resolve('public'),
              this.resolveDist('generated/public')
            )
        )
    ])
    // Hoist rootPublicFiles
    await Promise.all(
      this.options.rootPublicFiles.map(async file => {
        const from = path.resolve('public', file)
        const exists = await fs.pathExists(from)
        return exists && fs.copy(from, this.resolveDist('generated', file))
      })
    )
    // Remove unnecessary files
    await fs.remove(this.resolveDist('generated/_ream/client-manifest.json'))

    await Promise.all(
      routes.map(async route => {
        // Fake req
        const context = { req: { url: route } }
        const html = await this.renderer.renderToString(context)
        const { start, end } = renderTemplate(this.template, context)
        const targetPath = this.resolveDist(
          `generated/${route.replace(/\/?$/, '/index.html')}`
        )

        logger.status(emoji.progress, `generating ${route}`)

        await fs.ensureDir(path.dirname(targetPath))
        await fs.writeFile(targetPath, start + html + end, 'utf8')
      })
    )

    logger.status(
      emoji.success,
      chalk.green(
        `Check out ${path.relative(
          process.cwd(),
          this.resolveDist('generated')
        )}`
      )
    )
  }

  async getServer() {
    const notFound = (req, res) => () => {
      res.statusCode = 404
      res.end('not found')
    }

    const server = polka()

    if (this.options.dev) {
      await this.prepareWebpack()
      this.runExtendWebpackFns()
      require('./utils/setupWebpackMiddlewares')(this)(server)
    } else {
      this.prepareProduction({ serverType: 'production' })
      server.get('/_ream/*', (req, res) => {
        req.url = req.url.replace(/^\/_ream/, '')
        serveStatic(
          this.resolveDist('client'),
          true // Cache
        )(req, res, notFound(req, res))
      })
    }

    server.get('/public/*', (req, res) => {
      serveStatic(process.cwd(), !this.options.dev)(
        req,
        res,
        notFound(req, res)
      )
    })

    for (const rootPublicFile of this.options.rootPublicFiles) {
      server.get(`/${rootPublicFile}`, (req, res) => {
        serveStatic(path.resolve('public'), !this.options.dev)(
          req,
          res,
          notFound(req, res)
        )
      })
    }

    server.get('*', (req, res) => {
      if (!this.renderer) {
        return res.end('Please wait for compilation...')
      }

      const context = { req }

      const renderStream = this.renderer.renderToStream(context)

      let splitContent
      res.setHeader('content-type', 'text/html')

      renderStream.once('data', () => {
        splitContent = renderTemplate(this.template, context)
        res.write(splitContent.start)
      })

      renderStream.on('data', chunk => {
        res.write(chunk)
      })

      renderStream.on('end', () => {
        res.end(splitContent.end)
      })

      renderStream.on('error', err => {
        if (err.code === 404) return notFound(req, res)()
        res.end(err.stack)
        if (err.name === 'ReamError') {
          console.log(err.message)
        } else {
          console.log(err.stack)
        }
      })
    })

    return server
  }

  async getRequestHandler() {
    const server = await this.getServer()
    return (req, res) => server.handler(req, res)
  }

  async start() {
    const server = await this.getServer()
    return server.listen(this.options.server.port, this.options.server.host)
  }

  async prepareWebpack() {
    const postcssrc = require('postcss-load-config')

    const handleError = err => {
      if (err.message.indexOf('No PostCSS Config found') === -1) {
        throw err
      }
      // Return empty options for PostCSS
      return {}
    }

    const postcssConfig = await postcssrc({}, process.cwd(), {
      argv: false
    }).catch(handleError)

    if (postcssConfig.file) {
      logger.debug('postcss config', postcssConfig.file)
      this.options.postcss = postcssConfig.options
      logger.debug('postcss options', this.options.postcss)
    }
  }

  prepareProduction({ serverType } = {}) {
    const serverBundle = JSON.parse(
      fs.readFileSync(this.resolveDist('server/server-bundle.json'), 'utf8')
    )
    const clientManifest = JSON.parse(
      fs.readFileSync(this.resolveDist('client/client-manifest.json'), 'utf8')
    )
    const template = fs.readFileSync(this.options.html, 'utf8')

    this.createRenderer({
      serverBundle,
      clientManifest,
      template,
      serverType
    })
  }

  // Async readBundleMeta() {
  //   const [serverBundle, clientManifest, template] = await Promise.all([
  //     fs
  //       .readFile(this.resolveDist('server/server-bundle.json'), 'utf8')
  //       .then(JSON.parse),
  //     fs
  //       .readFile(this.resolveDist('client/client-manifest.json'), 'utf8')
  //       .then(JSON.parse),
  //     fs.readFile(this.resolveDist('client/index.html'), 'utf8')
  //   ])

  //   return {
  //     serverBundle,
  //     clientManifest,
  //     template
  //   }
  // }

  createRenderer({ template, serverBundle, clientManifest, serverType }) {
    this.template = template
    this.renderer = createBundleRenderer(serverBundle, {
      runInNewContext: false,
      clientManifest
    })
    this.emit('renderer-ready', serverType)
  }

  resolveDist(...args) {
    return path.resolve('.ream', ...args)
  }
}

function ream(opts) {
  return new Ream(opts)
}
module.exports = ream
module.exports.Ream = Ream
