#!/usr/bin/env node
const cac = require('cac')
const chalk = require('chalk')
const logger = require('../lib/logger')

const major = parseInt(process.versions.node.split('.')[0], 10)
if (major < 8) {
  // eslint-disable-next-line import/no-unassigned-import
  require('async-to-gen/register')
}

const cli = cac()

const logUrl = app => {
  app.on('renderer-ready', () => {
    logger.log(
      `\n  App running at:\n\n  - Local: ${chalk.bold(
        `http://localhost:${app.options.server.port}`
      )}\n`
    )
  })
}

const getOptions = (dev, input, flags) => {
  const options = {
    ...flags,
    dev,
    entry: input[0]
  }
  if (!options.entry) {
    delete options.entry
  }
  return options
}

cli
  .command('build', 'Build your application', (input, flags) => {
    const options = getOptions(false, input, flags)
    const app = require('../lib')(options)
    return app.build()
  })
  .option('config', {
    alias: 'c',
    desc: 'Load a config file (default: ream.config.js)'
  })
  .option('debug', 'Output debug logs')

cli
  .command('dev', 'Develop your application', (input, flags) => {
    const options = getOptions(true, input, flags)
    const app = require('../lib')(options)
    logUrl(app)
    return app.start()
  })
  .option('config', {
    alias: 'c',
    desc: 'Load a config file (default: ream.config.js)'
  })
  .option('host', 'Server host (default: 0.0.0.0)')
  .option('port', 'Server port (default: 4000)')
  .option('debug', 'Output debug logs')

cli
  .command('start', 'Start your application in production', (input, flags) => {
    const options = getOptions(false, input, flags)
    const app = require('../lib')(options)
    logUrl(app)
    return app.start()
  })
  .option('config', {
    alias: 'c',
    desc: 'Load a config file (default: ream.config.js)'
  })
  .option('host', 'Server host (default: 0.0.0.0)')
  .option('port', 'Server port (default: 4000)')
  .option('debug', 'Output debug logs')

cli
  .command('generate', 'Generate static html files', (input, flags) => {
    const options = getOptions(false, input, flags)
    const app = require('../lib')(options)
    return app.generate()
  })
  .option('config', {
    alias: 'c',
    desc: 'Load a config file (default: ream.config.js)'
  })
  .option('debug', 'Output debug logs')

cli.parse()
