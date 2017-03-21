#!/usr/bin/env node
const fs = require('fs')
const yargs = require('yargs')
const pkg = require('../package')
const _ = require('../lib/utils')

const cli = yargs
  .command('build', 'Build your app')
  .command('start', 'Start app in production mode')
  .command('dev', 'Start app in development mode')
  .option('port', {
    description: 'Server port',
    default: 3000
  })
  .option('config', {
    description: 'Path to config file',
    default: 'unvue.config.js'
  })
  .version(pkg.version)
  .alias('v', 'version')
  .alias('h', 'help')
  .help()

const argv = cli.argv

const input = argv._
const command = input[0]

const commands = ['dev', 'start', 'build']

if (commands.indexOf(command) === -1) {
  cli.showHelp()
  process.exit()
}

const unvue = require('../lib')

let config = {}
const port = argv.port

if (fs.existsSync(argv.config)) {
  config = require(_.cwd(argv.config))
}

const app = unvue(Object.assign(
  {},
  config,
  { dev: command === 'dev' }
))

app.on('valid', () => {
  unvue.displayStats(app.stats)
  if (command !== 'build') {
    console.log(`> Open http://localhost:${port}`)
  }
})

if (command === 'build') {
  console.log('> Building...')
  app.build().catch(err => {
    console.error(err)
    process.exit(1)
  })
} else {
  if (command === 'start') {
    console.log('> Starting production server')
  } else {
    console.log('> Starting development server')
  }

  app.prepare()
    .then(() => {
      const server = require('express')()

      server.get('*', require('compression')(), app.getRequestHandler())
      server.listen(port)
    })
}
