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
    const { host, port } = app.config.server
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
  const options = Object.assign({}, flags, {
    dev,
    baseDir: input[0]
  })
  const config = {}
  if (command === 'dev' || command === 'start') {
    if (flags.host) {
      config.server = merge(config.server, { host: flags.host })
    }
    if (flags.port) {
      config.server = merge(config.server, { port: flags.port })
    }
  }
  return {
    options,
    config
  }
}

cli.command('build', 'Build your application', (input, flags) => {
  const { options, config } = getOptions('build', input, flags)
  const app = require('../lib')(options, config)
  return app.build()
})

cli
  .command('dev', 'Develop your application', (input, flags) => {
    const { options, config } = getOptions('dev', input, flags)
    const app = require('../lib')(options, config)
    logUrl(app)
    return app.start()
  })
  .option('host', 'Server host (default: 0.0.0.0)')
  .option('port', 'Server port (default: 4000)')

cli
  .command('start', 'Start your application in production', (input, flags) => {
    const { options, config } = getOptions('start', input, flags)
    const app = require('../lib')(options, config)
    logUrl(app)
    return app.start()
  })
  .option('host', 'Server host (default: 0.0.0.0)')
  .option('port', 'Server port (default: 4000)')

cli.command('generate', 'Generate static html files', (input, flags) => {
  const { options, config } = getOptions('generate', input, flags)
  const app = require('../lib')(options, config)
  return app.generate()
})

cli
  .option('config', {
    alias: 'c',
    desc: 'Load a config file (default: ream.config.js)'
  })
  .option('debug', 'Print debug logs')
  .option('inspectWebpack', 'Print webpack config as string')
  .option('progress', 'Toggle progress bar')

cli.parse()
