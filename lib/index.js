const fs = require('fs')
const chalk = require('chalk')
const serialize = require('serialize-javascript')
const _ = require('./utils')

function createRenderer(bundle, template) {
  return require('vue-server-renderer').createBundleRenderer(bundle, {
    template,
    cache: require('lru-cache')({
      max: 1000,
      maxAge: 1000 * 60 * 15
    })
  })
}

function runPostCompile(stats = {}, cb) {
  if (!stats.server && !stats.client) return

  process.stdout.write('\x1Bc')

  // if one of the compilations errors
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

  // compiled successfully
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

  cb && cb()
}

function build({
  cwd = process.cwd(),
  html,
  extendWebpack,
  postCompile
}) {
  return require('./build')({
    cwd,
    html,
    extendWebpack
  }).then(([clientStats, serverstats]) => {
    return runPostCompile({
      client: clientStats,
      server: serverstats
    }, postCompile)
  })
}

function unvue(app, options = {}) {
  const express = require('express')
  const compression = require('compression')

  const dev = options.dev
  const cwd = options.cwd || process.cwd()
  const shouldBuild = typeof options.build === 'boolean' ? options.build : true

  let template

  const serve = (path, cache) => express.static(_.cwd(cwd, path), {
    maxAge: cache && !dev ? 60 * 60 * 24 * 30 : 0
  })

  let renderer

  const serverInfo =
    `express/${require('express/package.json').version} ` +
    `vue-server-renderer/${require('vue-server-renderer/package.json').version} ` +
    `unvue/${require('../package.json').version}`

  app.use('/public', serve('public', true))
  app.use('/dist', serve('dist', true))

  if (dev && !renderer) {
    // In development: setup the dev server with watch and hot-reload,
    // and create a new renderer on bundle / index template update.
    console.log('> Starting development server')
    require('./setup-dev-server')({
      app,
      cwd,
      dev,
      html: options.html,
      extendWebpack: options.extendWebpack
    }, (bundle, _template, stats) => {
      runPostCompile(stats, options.postCompile)
      template = _template
      renderer = createRenderer(bundle)
    })
  }

  if (!dev && !renderer) {
    console.log('> Starting production server')

    const handleBuild = () => {
      const bundle = require(_.cwd(cwd, './dist/vue-ssr-bundle.json'))
      template = fs.readFileSync(_.cwd(cwd, './dist/index.html'), 'utf-8')
      renderer = createRenderer(bundle)
    }

    if (shouldBuild) {
      build({
        cwd,
        html: options.html,
        extendWebpack: options.extendWebpack,
        postCompile: options.postCompile
      }).then(handleBuild)
    } else {
      handleBuild()
      options.postCompile && options.postCompile()
    }
  }

  app.get('*', compression({ threshold: 0 }), (req, res) => {
    if (!renderer) {
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

    const context = { url: req.url }

    const renderStream = renderer.renderToStream(context)

    const [start, end] = template.split('<!--unvue-app-placeholder-->')

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
  })
}

unvue.build = build

module.exports = unvue
