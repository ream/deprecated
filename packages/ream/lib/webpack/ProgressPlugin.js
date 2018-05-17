const webpack = require('webpack')
const chalk = require('chalk')
const logger = require('../logger')
const emoji = require('../emoji')

module.exports = class ProgressPlugin {
  apply(compiler) {
    compiler.plugin('done', stats => {
      if (stats.hasErrors() || stats.hasWarnings()) {
        return logger.log(stats.toString({
          colors: true,
          version: false,
          timings: false,
          assets: false,
          chunks: false,
          modules: false,
          hash: false,
          errorDetails: true
        }))
      }
      logger.status(emoji.success, chalk.green(`Compiled successfully!`))
    })
  }
}
