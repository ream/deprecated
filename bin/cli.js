#!/usr/bin/env node
const fs = require('fs')
const yargs = require('yargs')
const co = require('co')
const chalk = require('chalk')
const tildify = require('tildify')
const update = require('update-notifier')
const pkg = require('../package')
const _ = require('../lib/utils')
const loadConfig = require('../lib/load-config')

update({ pkg }).notify()

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
    default: 'ream.config.js'
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

const ream = require('../lib')

let config = {}
const port = argv.port

if (fs.existsSync(argv.config)) {
  config = require(_.cwd(argv.config))
}

const generateOptions = config.generate
delete config.generate

co(function * () {
  const defaultOptions = {}

  if (typeof config.babel === 'undefined') {
    defaultOptions.babel = yield loadConfig.babel()
  }
  if (typeof config.postcss === 'undefined') {
    defaultOptions.postcss = yield loadConfig.postcss()
  }

  const app = ream(Object.assign(
    defaultOptions,
    config,
    { dev: command === 'dev' }
  ))

  app.on('ready', () => {
    ream.displayStats(app.stats)
    if (command === 'build') {
      if (argv.stats) {
        console.log('> Generating stats file...')
        fs.writeFileSync('./client-stats.json', JSON.stringify(app.stats.client.toJson()), 'utf8')
        console.log(`> Generated at ./client-stats.json`)
      }
    } else {
      console.log(`> Open http://localhost:${port}`)
    }
  })

  if (command === 'build') {
    console.log('> Building...')
    yield app.build()
    console.log('> Done')
  } else if (command === 'generate') {
    console.log('> Generating...')
    const opts = yield Promise.resolve()
      .then(() => {
        if (typeof generateOptions === 'function') {
          return generateOptions()
        }
        return generateOptions
      })
    let dir = yield app.generate(opts)
    dir = tildify(dir)
    console.log(`> Static website is generated into ${dir} folder`)
    console.log(`\n  You may use a static website to preview it:`)
    console.log(`  ${chalk.yellow('yarn')} global add serve`)
    console.log(`  ${chalk.yellow('serve')} ${dir} -s\n`)
  } else {
    if (command === 'start') {
      console.log('> Starting production server')
    } else {
      console.log('> Starting development server')
    }

    yield app.prepare()

    const server = require('express')()

    server.get('*', app.getRequestHandler())
    server.listen(port, '0.0.0.0')
  }
}).catch(err => {
  console.error(err.stack)
  process.exit(1)
})
