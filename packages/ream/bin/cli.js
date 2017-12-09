#!/usr/bin/env node
const cac = require('cac')
const readConfig = require('../lib/read-config')

const cli = cac()

const startServer = async (dev, flags) => {
  console.log(`> Starting ${dev ? 'development' : 'production'} server...`)
  const config = readConfig(flags.config)
  const options = Object.assign({
    host: '0.0.0.0',
    port: 5000
  }, config, flags, {
    dev
  })
  const Ream = require('ream-core')
  const app = require('express')()

  const ream = new Ream(options)
  app.get('*', await ream.getRequestHandler())
  app.listen(options.port, options.host)
  if (!dev) {
    console.log(`> Open http://${options.host}:${options.port}`)
  }
}

cli.command('dev', {
  desc: 'Run app in dev mode'
}, (input, flags) => {
  return startServer(true, flags)
})

const build = cli.command('build', {
  desc: 'Build app in production mode'
}, async (input, flags) => {
  console.log('> Building...')
  const config = readConfig(flags.config)
  const options = Object.assign({}, config, flags, {
    dev: false
  })
  const Ream = require('ream-core')
  const ream = new Ream(options)
  await ream.build()
  console.log(`> Done! check out ${ream.buildOptions.output.path}`)
})

build.option('bundle-report', {
  desc: 'Display bundle report in brower'
})

cli.command('start', {
  desc: 'Run app in production mode'
}, (input, flags) => {
  return startServer(false, flags)
})

cli.command('generate', {
  desc: 'Generate static website'
}, async (input, flags) => {
  console.log('> Generating...')
  const config = readConfig(flags.config)
  const generateConfig = config.generate || {}
  delete config.generate
  const options = Object.assign({}, config, flags, {
    dev: false
  })
  const Ream = require('ream-core')
  const ream = new Ream(options)
  await ream.build()
  const folderPath = await ream.generate(generateConfig)
  console.log(`> Done! check out ${folderPath}`)
})

cli.parse()
