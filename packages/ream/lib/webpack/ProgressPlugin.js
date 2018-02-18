const webpack = require('webpack')
const chalk = require('chalk')
const logger = require('../logger')
const prettyPath = require('../utils/prettyPath')
const emoji = require('../emoji')

module.exports = class ProgressPlugin extends webpack.ProgressPlugin {
  constructor({ progress } = {}) {
    super((percent, msg, ...details) => {
      if (msg && progress !== false) {
        let modulePath = details[details.length - 1] || ''
        if (modulePath) {
          modulePath = prettyPath(modulePath)
        }
        logger.status(
          emoji.progress,
          `${Math.floor(percent * 100)}% ${msg} ${modulePath}`,
          true
        )
      }
    })
  }

  apply(compiler) {
    super.apply(compiler)
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
