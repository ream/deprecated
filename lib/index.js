const path = require('path')
const Event = require('events')
const fs = require('fs-extra')
const Config = require('webpack-chain')
const express = require('express')
const chalk = require('chalk')
const chokidar = require('chokidar')
const merge = require('lodash.merge')
const { createBundleRenderer } = require('vue-server-renderer')
const loadConfig = require('./utils/loadConfig')
const basePlugin = require('./plugins/base')
const logger = require('./logger')
const serveStatic = require('./utils/serveStatic')
const renderTemplate = require('./utils/renderTemplate')
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

    this.baseDir = path.resolve(options.baseDir || '.')
    delete options.baseDir

    // Load ream config
    const { data: config, path: configPath } = loadConfig.loadSync(
      [options.config || 'ream.config.js'],
      this.baseDir
    )
    if (configPath) {
      logger.debug('ream config', configPath)
    }

    // Init options
    this.options = merge(
      {
        entry: 'index.js',
        fsRoutes: {
          baseDir: 'pages',
          basePath: '/',
          match: /\.(vue|js)$/i
        },
        plugins: [],
        server: {
          host: process.env.HOST || '0.0.0.0',
          port: process.env.PORT || 4000
        },
        generate: {
          routes: ['/']
        },
        css: {
          extract: !options.dev
        }
      },
      config,
      options
    )

    logger.debug('ream options', inspect(this.options))

    this.hooks = require('./hooks')
    this.configureServerFns = new Set()
    this.enhanceAppFiles = new Set()
    this.serverConfig = new Config()
    this.clientConfig = new Config()
    this.chainWebpackFns = []

    const projectPkg = loadConfig.loadSync(['package.json'])
    this.projectPkg = {
      data: projectPkg.data || {},
      path: projectPkg.path
    }

    this.loadPlugins()
  }

  chainWebpack(fn) {
    this.chainWebpackFns.push(fn)
  }

  addGenerateRoutes(routes) {
    this.options.generate.routes = this.options.generate.routes.concat(routes)
    return this
  }

  runChainWebpackFns() {
    for (const fn of this.chainWebpackFns) {
      fn(this.serverConfig, {
        type: 'server',
        isServer: true,
        isClient: false,
        dev: this.options.dev
      })
      fn(this.clientConfig, {
        type: 'client',
        isServer: false,
        isClient: true,
        dev: this.options.dev
      })
    }
  }

  hasPlugin(name) {
    return this.plugins && this.plugins.find(plugin => plugin.name === name)
  }

  loadPlugins() {
    this.plugins = [
      basePlugin,
      require('./plugins/vuex'),
      require('./plugins/apollo'),
      require('./plugins/pwa'),
      require('./plugins/fs-routes')
    ]
      .concat(this.options.plugins)
      .filter(Boolean)

    this.plugins.forEach(plugin => plugin.apply(this))
  }

  createConfigs() {
    // Run the `chainWebpack` functions added by config file and plugins
    this.runChainWebpackFns()

    if (this.options.debugWebpack) {
      console.log('server config', chalk.dim(this.serverConfig.toString()))
      console.log('client config', chalk.dim(this.clientConfig.toString()))
    }

    const serverConfig = this.serverConfig.toConfig()
    const clientConfig = this.clientConfig.toConfig()

    return [serverConfig, clientConfig]
  }

  createCompilers() {
    const webpack = require('webpack')

    return this.createConfigs().map(config => webpack(config))
  }

  async build() {
    await fs.remove(this.resolveOutDir())
    await this.prepareWebpack()
    const [serverCompiler, clientCompiler] = this.createCompilers()
    await Promise.all([runWebpack(serverCompiler), runWebpack(clientCompiler)])
    if (!this.isGenerating) {
      await this.hooks.run('onFinished', 'build')
    }
  }

  async generate(opts) {
    this.isGenerating = true
    await this.build()
    await this.generateOnly(opts)
    await this.hooks.run('onFinished', 'generate')
  }

  async generateOnly({ routes } = this.options.generate) {
    routes = [...new Set(routes)]
    // Not an actually server
    // Don't emit `server-ready` event
    this.prepareProduction({ serverType: 'generate' })

    // Copy public folder to root path of `generated`
    if (await fs.pathExists('./public')) {
      await fs.copy('./public', this.resolveOutDir('generated'))
    }

    // Copy webpack assets to `generated`
    await fs.copy(
      this.resolveOutDir('client'),
      this.resolveOutDir('generated/_ream')
    )

    // Remove unnecessary files
    await fs.remove(this.resolveOutDir('generated/_ream/client-manifest.json'))

    await Promise.all(
      routes.map(async route => {
        // Fake req
        const context = { req: { url: route } }
        const html = await this.renderer.renderToString(context)
        const { start, end } = await renderTemplate(context)
        const targetPath = this.resolveOutDir(
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
          this.resolveOutDir('generated')
        )}`
      )
    )
  }

  configureServer(fn) {
    this.configureServerFns.add(fn)
  }

  async prepareFiles() {
    await fs.ensureDir(this.resolveOutDir())
    await this.writeCreateAppFile()
    await this.writeEntryFile()
    await this.hooks.run('onPrepareFiles')
  }

  writeCreateAppFile() {
    return fs.writeFile(
      this.resolveOutDir('create-app.js'),
      require('../app/create-app-template')(this)
    )
  }

  async writeEntryFile() {
    const writeFile = () =>
      fs.writeFile(
        this.resolveOutDir('entry.js'),
        require('../app/entry-template')(this)
      )
    writeFile()
    if (this.options.entry && this.options.dev) {
      chokidar
        .watch(this.resolveBaseDir(this.options.entry), {
          disableGlobbing: true,
          ignoreInitial: true
        })
        .on('add', writeFile)
        .on('unlink', writeFile)
    }
  }

  async getServer() {
    const server = express()

    for (const fn of this.configureServerFns) {
      fn(server)
    }

    // Compress
    server.use(require('compression')())

    // Serve ./public folder at root path
    server.use(serveStatic('public', !this.options.dev))

    if (this.options.dev) {
      await this.prepareWebpack()
      require('./utils/setupWebpackMiddlewares')(this)(server)
    } else {
      this.prepareProduction({ serverType: 'production' })
      server.get('/_ream/*', (req, res, ...args) => {
        req.url = req.url.replace(/^\/_ream/, '')
        serveStatic(
          this.resolveOutDir('client'),
          typeof req.shouldCache === 'boolean' ? req.shouldCache : true // Cache
        )(req, res, ...args)
      })
    }

    const handleError = fn => {
      return async (req, res) => {
        try {
          await fn(req, res)
        } catch (err) {
          if (err.name === 'ReamError') {
            if (err.code === 'REDIRECT') {
              res.writeHead(303, { Location: err.redirectURL })
              res.end()
              return
            }
          }

          if (process.env.NODE_ENV === 'production') {
            res.end('server error')
          } else {
            res.end(err.stack)
          }

          console.log(err.stack)
        }
      }
    }

    server.get(
      '*',
      handleError(async (req, res) => {
        if (!this.renderer) {
          return res.end('Please wait for compilation...')
        }

        if (req.url.startsWith('/_ream/')) {
          res.status(404)
          return res.end('404')
        }

        const context = { req, res }
        const html = await this.renderer.renderToString(context)
        const { start, end } = renderTemplate(context)

        res.setHeader('content-type', 'text/html')
        res.end(start + html + end)
      })
    )

    return server
  }

  async getRequestHandler() {
    const server = await this.getServer()
    return (req, res) => server(req, res)
  }

  async start() {
    const server = await this.getServer()
    return server.listen(this.options.server.port, this.options.server.host)
  }

  async prepareWebpack() {
    let postcssConfigFile
    if (this.projectPkg.path && this.projectPkg.data.postcss) {
      postcssConfigFile = this.projectPkg.path
    } else {
      const res = loadConfig.loadSync([
        'postcss.config.js',
        '.postcssrc',
        '.postcssrc.js'
      ])
      postcssConfigFile = res.path
    }

    if (postcssConfigFile) {
      logger.debug('postcss config file', postcssConfigFile)
      this.options.postcss = {
        config: {
          path: postcssConfigFile
        }
      }
    }

    await this.prepareFiles()
  }

  prepareProduction({ serverType } = {}) {
    const serverBundle = JSON.parse(
      fs.readFileSync(this.resolveOutDir('server/server-bundle.json'), 'utf8')
    )
    const clientManifest = JSON.parse(
      fs.readFileSync(this.resolveOutDir('client/client-manifest.json'), 'utf8')
    )

    this.createRenderer({
      serverBundle,
      clientManifest,
      serverType
    })
  }

  createRenderer({ serverBundle, clientManifest, serverType }) {
    this.renderer = createBundleRenderer(serverBundle, {
      runInNewContext: false,
      clientManifest,
      basedir: this.options.resolveFromLocal ? this.resolveOutDir() : null
    })
    this.emit('renderer-ready', serverType)
  }

  resolveOutDir(...args) {
    return this.resolveBaseDir('.ream', ...args)
  }

  resolveBaseDir(...args) {
    return path.resolve(this.baseDir, ...args)
  }
}

function ream(opts) {
  return new Ream(opts)
}
module.exports = ream
module.exports.Ream = Ream
