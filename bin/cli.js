#!/usr/bin/env node
const cac = require('cac')
const chalk = require('chalk')
const merge = require('lodash.merge')
const logger = require('../lib/logger')

const major = parseInt(process.versions.node.split('.')[0], 10)
if (major < 8) {
  // eslint-disable-next-line import/no-unassigned-import
  require('async-to-gen/register')
}

const cli = cac()

const logUrl = app => {
  let ip
  app.on('renderer-ready', () => {
    const { host, port } = app.options.server
    const isDefaultRoute = host === '0.0.0.0'
    logger.log(
      `\n  App running at:\n\n  - Local: ${chalk.bold(
        `http://${isDefaultRoute ? 'localhost' : host}:${port}`
      )}\n${
        isDefaultRoute
          ? chalk.dim(
              `  - Network: http://${ip ||
                (ip = require('internal-ip').v4.sync())}:${port}`
            )
          : ''
      }`
    )
  })
}

const getOptions = (command, input, flags) => {
  const dev = command === 'dev'
  const options = {
    dev,
    baseDir: input[0]
  }
  if (command === 'dev' || command === 'start') {
    if (flags.host) {
      options.server = merge(options.server, { host: flags.host })
    }
    if (flags.port) {
      options.server = merge(options.server, { port: flags.port })
    }
  }
  return options
}

cli.command('build', 'Build your application', (input, flags) => {
  const options = getOptions('build', input, flags)
  const app = require('../lib')(options)
  return app.build()
})

cli
  .command('dev', 'Develop your application', (input, flags) => {
    const options = getOptions('dev', input, flags)
    const app = require('../lib')(options)
    logUrl(app)
    return app.start()
  })
  .option('host', 'Server host (default: 0.0.0.0)')
  .option('port', 'Server port (default: 4000)')

cli
  .command('start', 'Start your application in production', (input, flags) => {
    const options = getOptions('start', input, flags)
    const app = require('../lib')(options)
    logUrl(app)
    return app.start()
  })
  .option('host', 'Server host (default: 0.0.0.0)')
  .option('port', 'Server port (default: 4000)')

cli.command('generate', 'Generate static html files', (input, flags) => {
  const options = getOptions('generate', input, flags)
  const app = require('../lib')(options)
  return app.generate()
})

cli
  .option('config', {
    alias: 'c',
    desc: 'Load a config file (default: ream.config.js)'
  })
  .option('debug', 'Output debug logs')

cli.parse()
