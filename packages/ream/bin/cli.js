#!/usr/bin/env node
const cac = require('cac')
const readConfig = require('../lib/read-config')

const cli = cac()

const startServer = (dev, flags) => {
  console.log(`> Starting ${dev ? 'development' : 'production'} server...`)
  const config = readConfig()
  const options = Object.assign({
    host: '0.0.0.0',
    port: 5000
  }, config, flags, {
    dev
  })
  const Ream = require('ream-core')
  const app = require('express')()

  const ream = new Ream(options)
  ream.prepare()
  app.get('*', ream.getRequestHandler())
  app.listen(options.port, options.host)
  if (!dev) {
    console.log(`> Open http://${options.host}:${options.port}`)
  }
}

cli.command('dev', {
  desc: 'Run app in dev mode'
}, (input, flags) => {
  startServer(true, flags)
})

const build = cli.command('build', {
  desc: 'Build app in production mode'
}, (input, flags) => {
  console.log('> Building...')
  const config = readConfig()
  const options = Object.assign({}, config, flags, {
    dev: false
  })
  const Ream = require('ream-core')
  const ream = new Ream(options)
  ream.build().then(() => {
    console.log(`> Done! check out ${ream.buildOptions.output.path}`)
  }, err => {
    console.error(err)
    process.exit(1)
  })
})

build.option('bundle-report', {
  desc: 'Display bundle report in brower'
})

cli.command('start', {
  desc: 'Run app in production mode'
}, (input, flags) => {
  startServer(false, flags)
})

cli.command('generate', {
  desc: 'Generate static website'
}, (input, flags) => {
  console.log('> Generating...')
  const config = readConfig()
  const generateConfig = config.generate || {}
  delete config.generate
  const options = Object.assign({}, config, flags, {
    dev: false
  })
  const Ream = require('ream-core')
  const ream = new Ream(options)
  ream.build().then(() => {
    ream.prepare()
    return ream.generate(generateConfig).then(folderPath => {
      console.log(`> Done! check out ${folderPath}`)
    })
  }).catch(err => {
    console.error(err)
    process.exit(1)
  })
})

cli.parse()
