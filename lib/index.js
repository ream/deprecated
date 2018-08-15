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
const validateConfig = require('./validateConfig')

const runWebpack = compiler => {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err)
      resolve(stats)
    })
  })
}

class Ream extends Event {
  constructor(options, config) {
    super()
    this.options = merge(
      {
        dev: process.env.NODE_ENV !== 'production',
        baseDir: '.',
        config: 'ream.config.js'
      },
      options
    )

    // Init logger options
    logger.setOptions(options)

    // Load ream config
    let userConfig
    if (this.options.config !== false) {
      const loadedConfig = loadConfig.loadSync(
        [this.options.config],
        this.options.baseDir
      )
      if (loadedConfig.path) {
        logger.debug('ream config', loadedConfig.path)
        userConfig = loadedConfig.data
      }
    }
    const validatedUserConfig = validateConfig(
      this.options.dev,
      userConfig || {}
    )
    if (validatedUserConfig.error) {
      throw validatedUserConfig.error
    }

    // config from constructor can override user config
    this.config = merge(validatedUserConfig.value, config)

    logger.debug('ream config', inspect(this.config))

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
    this.config.generate.routes = this.config.generate.routes.concat(routes)
    return this
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
      .concat(this.config.plugins)
      .filter(Boolean)

    this.plugins.forEach(plugin => plugin.apply(this))
  }

  createConfigs() {
    const getContext = type => ({
      isServer: type === 'server',
      isClient: type === 'client',
      dev: this.options.dev,
      type
    })

    if (this.config.chainWebpack) {
      this.chainWebpack(this.config.chainWebpack)
    }
    for (const fn of this.chainWebpackFns) {
      fn(this.serverConfig, getContext('server'))
      fn(this.clientConfig, getContext('client'))
    }

    if (this.config.inspectWebpack) {
      console.log('server config', chalk.dim(this.serverConfig.toString()))
      console.log('client config', chalk.dim(this.clientConfig.toString()))
    }

    let serverConfig = this.serverConfig.toConfig()
    let clientConfig = this.clientConfig.toConfig()

    const { configureWebpack } = this.config
    if (typeof configureWebpack === 'function') {
      serverConfig =
        configureWebpack(serverConfig, getContext('server')) || serverConfig
      clientConfig =
        configureWebpack(clientConfig, getContext('client')) || clientConfig
    }

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

  async generateOnly({ routes } = this.config.generate) {
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
    await Promise.all([
      this.writeCreateAppFile(),
      this.writeEntryFile(),
      this.hooks.run('onPrepareFiles')
    ])
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
    if (this.config.entry && this.options.dev) {
      chokidar
        .watch(this.resolveBaseDir(this.config.entry), {
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

          if (this.options.dev) {
            res.end(err.stack)
          } else {
            res.end('server error')
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
    return server.listen(this.config.server.port, this.config.server.host)
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
      this.config.postcss = {
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
      clientManifest
    })
    this.emit('renderer-ready', serverType)
  }

  resolveOutDir(...args) {
    return this.resolveBaseDir('.ream', ...args)
  }

  resolveBaseDir(...args) {
    return path.resolve(this.options.baseDir, ...args)
  }
}

function ream(opts) {
  return new Ream(opts)
}
module.exports = ream
module.exports.Ream = Ream
