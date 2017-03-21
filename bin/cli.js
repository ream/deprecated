#!/usr/bin/env node
const fs = require('fs')
const yargs = require('yargs')
const chalk = require('chalk')
const tildify = require('tildify')
const pkg = require('../package')
const _ = require('../lib/utils')

const cli = yargs
  .command('build', 'Build your app')
  .command('start', 'Start app in production mode')
  .command('dev', 'Start app in development mode')
  .command('generate', 'Generate static website')
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

const commands = ['dev', 'start', 'build', 'generate']

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

if (command === 'build') {
  console.log('> Building...')
  app.build().then(() => {
    console.log('> Done')
  }).catch(handleError)
} else if (command === 'generate') {
  console.log('> Generating...')
  app.generate(config.generate)
    .then(dir => {
      dir = tildify(dir)
      console.log(`> Static website is generated into ${dir} folder`)
      console.log(`\n  You may use a static website to preview it:`)
      console.log(`  ${chalk.yellow('yarn')} global add serve`)
      console.log(`  ${chalk.yellow('serve')} ${dir} -s\n`)
    })
    .catch(handleError)
} else {
  app.on('ready', () => {
    unvue.displayStats(app.stats)
    if (command !== 'build') {
      console.log(`> Open http://localhost:${port}`)
    }
  })

  if (command === 'start') {
    console.log('> Starting production server')
  } else {
    console.log('> Starting development server')
  }

  app.prepare()
    .then(() => {
      const server = require('express')()

      server.get('*', app.getRequestHandler())
      server.listen(port)
    }).catch(handleError)
}

function handleError(err) {
  console.error(err.stack)
  process.exit(1)
}
